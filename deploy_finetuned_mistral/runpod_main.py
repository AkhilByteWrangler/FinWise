"""
main.py – RunPod Inference API for FinWise Financial Assistant

Launches a FastAPI server that wraps a fine-tuned Mistral model (via Unsloth).
The model is loaded with a LoRA adapter for financial question answering (FiQA-style prompts).

Accepts OpenAI-compatible `/v1/chat/completions` POST requests with multi-turn messages.

Install the following dependencies before running:
- bitsandbytes, accelerate, xformers, peft, trl, triton, cut_cross_entropy, unsloth_zoo
- sentencepiece, protobuf, datasets, huggingface_hub, hf_transfer
- unsloth, fastapi, uvicorn
"""

# === Install dependencies before running ===
# !pip --quiet install --no-deps bitsandbytes accelerate xformers==0.0.29.post3 peft trl==0.15.2 triton cut_cross_entropy unsloth_zoo
# !pip --quiet install sentencepiece protobuf datasets huggingface_hub hf_transfer
# !pip --quiet install --no-deps unsloth fastapi uvicorn

# === Imports ===
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import torch

from unsloth import FastLanguageModel
from transformers import AutoTokenizer

# === Model Load Parameters ===
max_seq_length = 2048
dtype = None  # auto-detect best precision
load_in_4bit = True  # reduce memory usage

# === Load base model and tokenizer ===
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/mistral-7b-instruct-v0.3-bnb-4bit",
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)

# Load fine-tuned LoRA weights for financial Q&A
model.load_adapter("achnew001/fiqa-mistral-7b-lora", adapter_name="default")
model.eval()

# === FastAPI Setup ===
app = FastAPI()

# === Request Models ===
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 256

# === Chat Endpoint ===
@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    # Build prompt with polite instruction style
    conversation = ""
    for m in request.messages:
        if m.role == "user":
            conversation += (
                "Below is an instruction that describes a task, paired with an input that provides further context. "
                "Write a response in a helpful, polite, and conversational tone.\n\n"
                "### Instruction:\nYou are a friendly and knowledgeable financial assistant. Respond with clarity and kindness.\n\n"
                f"### Input:\n{m.content}\n\n"
                "### Response:\n"
            )

    # Tokenize and generate
    inputs = tokenizer(conversation, return_tensors="pt").to("cuda")
    outputs = model.generate(
        **inputs,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature,
        top_p=0.95,
        do_sample=True,
    )

    # Post-process response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    cleaned = response.split("### Response:")[-1].strip()

    # Return OpenAI-compatible format
    return {
        "id": "chatcmpl-001",
        "object": "chat.completion",
        "model": request.model,
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": cleaned
            },
            "finish_reason": "stop"
        }]
    }
