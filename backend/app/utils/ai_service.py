import json
import re
from openai import OpenAI
from fastapi import HTTPException
from app.config import settings

MAX_CONTEXT_CHARS = 12000


def _truncate(text: str) -> str:
    if len(text) > MAX_CONTEXT_CHARS:
        return text[:MAX_CONTEXT_CHARS]
    return text


def call_openai(prompt: str, system: str = "", temperature: float = 0.4) -> str:
    """Calls OpenAI API for AI generation."""
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            instructions=system,
            input=prompt,
        )

        return response.output_text.strip()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI generation failed: {exc}"
        )
  

def _extract_json(raw: str):
    """Extract first valid JSON array/object found in model output."""
    raw = raw.strip()
    raw = re.sub(r"^```(json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    match = re.search(r"(\[.*\]|\{.*\})", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    raise HTTPException(status_code=502, detail="AI returned an invalid format. Please try again.")


def generate_summary(text: str, length: str = "medium") -> str:
    text = _truncate(text)
    length_map = {
        "short": "in 3-4 concise sentences",
        "medium": "in 2-3 well-structured paragraphs",
        "long": "in a detailed, comprehensive format with headings and bullet points covering all key concepts",
    }
    instruction = length_map.get(length, length_map["medium"])
    system = (
        "You are an expert academic study assistant. You create clear, accurate, "
        "well-organized summaries of study material for students."
    )
    prompt = (
        f"Summarize the following study material {instruction}. "
        f"Use markdown formatting where helpful. Do not add information not present in the text.\n\n"
        f"STUDY MATERIAL:\n{text}\n\nSUMMARY:"
    )
    return call_openai(prompt, system=system)


def answer_question(text: str, question: str) -> str:
    text = _truncate(text)
    system = (
        "You are a helpful, precise study assistant. Answer the student's question "
        "using only the provided study material. If the answer is not in the material, "
        "say so honestly and give your best general knowledge answer clearly labeled as such."
    )
    prompt = (
        f"STUDY MATERIAL:\n{text}\n\n"
        f"QUESTION: {question}\n\n"
        f"Provide a clear, well-explained ANSWER:"
    )
    return call_openai(prompt, system=system)


def generate_quiz(text: str, num_questions: int = 10) -> list:
    text = _truncate(text)
    system = (
        "You are an expert quiz creator for students. You always respond with valid JSON only, "
        "no explanations, no markdown fences."
    )
    prompt = (
        f"Based on the following study material, create exactly {num_questions} multiple choice "
        f"questions to test understanding. Each question must have exactly 4 options and one correct answer.\n\n"
        f"Return ONLY a JSON array in this exact format, nothing else:\n"
        f'[{{"question": "...", "options": ["A", "B", "C", "D"], '
        f'"correct_answer": "the exact text of the correct option", "explanation": "brief explanation"}}]\n\n'
        f"STUDY MATERIAL:\n{text}\n\nJSON:"
    )
    raw = call_openai(prompt, system=system, temperature=0.5)
    data = _extract_json(raw)
    if not isinstance(data, list) or len(data) == 0:
        raise HTTPException(status_code=502, detail="AI failed to generate a valid quiz.")
    return data


def generate_flashcards(text: str, num_cards: int = 10) -> list:
    text = _truncate(text)
    system = (
        "You are an expert study flashcard creator. You always respond with valid JSON only, "
        "no explanations, no markdown fences."
    )
    prompt = (
        f"Based on the following study material, create exactly {num_cards} flashcards "
        f"(question on front, concise answer on back) covering the most important concepts.\n\n"
        f'Return ONLY a JSON array in this exact format, nothing else:\n'
        f'[{{"question": "...", "answer": "..."}}]\n\n'
        f"STUDY MATERIAL:\n{text}\n\nJSON:"
    )
    raw = call_openai(prompt, system=system, temperature=0.5)
    data = _extract_json(raw)
    if not isinstance(data, list) or len(data) == 0:
        raise HTTPException(status_code=502, detail="AI failed to generate valid flashcards.")
    return data
