import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import prompts

# Load environment variables from .env file
load_dotenv()

# Initialize Gemini client
# Ensure GEMINI_API_KEY is present in your .env file
client = genai.Client()

def call_llm(system_prompt: str, user_content: str, model: str = "gemini-2.5-flash") -> str:
    """
    Utility function to call the LLM API using the new google-genai client.
    """
    try:
        response = client.models.generate_content(
            model=model,
            contents=[system_prompt, user_content],
            config=types.GenerateContentConfig(
                temperature=0.7, # Slightly creative but focused
            ),
        )
        return response.text
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return f"Error: {e}"

class ResearcherAgent:
    """Agent 1: Gathers global and regional flood statistics and geomorphological impacts."""
    def __init__(self):
        self.system_prompt = prompts.RESEARCHER_PROMPT

    def run(self, topic: str) -> str:
        print(f"\n[Researcher Agent] Gathering data for topic: '{topic}'...")
        content = f"Please gather and structure the flood data required for the topic: {topic}"
        return call_llm(self.system_prompt, content)

class ArchitectAgent:
    """Agent 2: Connects the problem to the I.S.E.E. architecture (NO 'ensemble' allowed)."""
    def __init__(self):
        self.system_prompt = prompts.ARCHITECT_PROMPT

    def run(self, researcher_data: str) -> str:
        print(f"\n[Chief Architect Agent] Connecting problem to I.S.E.E. architecture...")
        content = f"Based on the following research data, connect the problem to the I.S.E.E. architecture:\n\n{researcher_data}"
        return call_llm(self.system_prompt, content)

class WriterAgent:
    """Agent 3: Writes formal, world-class thesis chapters."""
    def __init__(self):
        self.system_prompt = prompts.WRITER_PROMPT

    def run(self, topic: str, researcher_data: str, architect_data: str) -> str:
        print(f"\n[Academic Writer Agent] Drafting the thesis chapter...")
        content = f"""Write the thesis chapter for the topic: {topic}.

Use the following research data:
{researcher_data}

Incorporate the following architectural logic:
{architect_data}
"""
        return call_llm(self.system_prompt, content)

class ReviewerAgent:
    """Agent 4: Verifies tone, accuracy, and ensures 'ensemble' is not used."""
    def __init__(self):
        self.system_prompt = prompts.REVIEWER_PROMPT

    def run(self, draft: str) -> str:
        print(f"\n[Peer Reviewer Agent] Reviewing and polishing the draft...")
        content = f"Please review, verify, and polish the following thesis chapter draft:\n\n{draft}"
        return call_llm(self.system_prompt, content)
