"""
Fine-tunes a 4-bit quantized LLM (LLaMA/Mistral/etc.) using the FiQA dataset via the Unsloth library.
This task-specific training improves the model's ability to handle financial question answering.

Unsloth is used for efficient training, including memory-optimized LoRA fine-tuning.

Steps:
- Load Unsloth-supported 4bit model (Meta-LLaMA, Mistral, Phi, etc.)
- Format FiQA dataset using Alpaca-style prompts
- Train using SFTTrainer with LoRA
- Run an example inference
- Save final fine-tuned model and tokenizer
"""

# ------------------ Install Required Dependencies ------------------
# Run these in Colab or shell before using the script
# !pip install --no-deps bitsandbytes accelerate xformers==0.0.29.post3 peft trl==0.15.2 triton cut_cross_entropy unsloth_zoo
# !pip install sentencepiece protobuf datasets huggingface_hub hf_transfer
# !pip install --no-deps unsloth

from unsloth import FastLanguageModel, is_bfloat16_supported
from transformers import TrainingArguments
from trl import SFTTrainer
from datasets import load_dataset
import torch

# ------------------ Model Configuration ------------------
max_seq_length = 2048
dtype = None  # Auto-detect best dtype for GPU
load_in_4bit = True  # Memory efficient

model_name = "unsloth/Meta-Llama-3.1-8B"  # Swap out as needed

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=model_name,
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
    use_rslora=False,
    loftq_config=None,
)

# ------------------ Prompt Formatting ------------------

alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

EOS_TOKEN = tokenizer.eos_token

def formatting_prompts_func(examples):
    instructions = ["Answer the financial question clearly and concisely."] * len(examples["question"])
    inputs = examples["question"]
    outputs = examples["answer"]
    texts = [
        alpaca_prompt.format(inst, inp, out) + EOS_TOKEN
        for inst, inp, out in zip(instructions, inputs, outputs)
    ]
    return { "text": texts }

# ------------------ Dataset Loading ------------------

dataset = load_dataset("LLukas22/fiqa", split="train")
dataset = dataset.map(formatting_prompts_func, batched=True)

# ------------------ Training ------------------

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=60,  
        learning_rate=2e-4,
        fp16=not is_bfloat16_supported(),
        bf16=is_bfloat16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
        report_to="none",
    )
)

# ------------------ Monitor GPU ------------------

gpu_stats = torch.cuda.get_device_properties(0)
start_gpu_memory = round(torch.cuda.max_memory_reserved() / 1024 / 1024 / 1024, 3)
max_memory = round(gpu_stats.total_memory / 1024 / 1024 / 1024, 3)

print(f"GPU = {gpu_stats.name}. Max memory = {max_memory} GB.")
print(f"{start_gpu_memory} GB of memory reserved.")

# ------------------ Train ------------------

trainer_stats = trainer.train()

# ------------------ Inference Example ------------------

FastLanguageModel.for_inference(model)

inputs = tokenizer(
    [
        alpaca_prompt.format(
            "Answer the financial question clearly and concisely.",
            "How does a 2 year treasury note work?",
            ""
        )
    ],
    return_tensors="pt"
).to("cuda")

outputs = model.generate(**inputs, max_new_tokens=256, use_cache=True)
print(tokenizer.batch_decode(outputs, skip_special_tokens=True)[0])

# ------------------ Save Model ------------------

model.save_pretrained("finetuned-mistral-fiqa")
tokenizer.save_pretrained("finetuned-mistral-fiqa")
print("Fine-tuned model saved to: finetuned-mistral-fiqa")
