import sys
import re
from agents import ResearcherAgent, ArchitectAgent, WriterAgent, ReviewerAgent

def get_output_filename(user_input: str) -> str:
    """
    Extract a logical chapter name from the user input if it specifies one,
    otherwise fallback to a default name.
    """
    match = re.search(r'chapter\s*(\d+)', user_input.lower())
    if match:
        chapter_num = match.group(1)
        return f"chapter_{chapter_num}_draft.md"
    return "thesis_draft.md"

def main():
    # If arguments are passed, use them as the topic prompt
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
    else:
        # Otherwise wait for prompt
        user_input = input("Enter your thesis request (e.g., 'Draft Chapter 1: Introduction based on 2025 flood data'): ")
    
    if not user_input.strip():
        print("Empty input. Exiting.")
        return

    print("=" * 60)
    print(f"Starting Multi-Agent Pipeline for topic:\n'{user_input}'")
    print("=" * 60)

    output_filename = get_output_filename(user_input)

    # Initialize Agents
    researcher = ResearcherAgent()
    architect = ArchitectAgent()
    writer = WriterAgent()
    reviewer = ReviewerAgent()

    # Pipeline Step 1: Research
    research_output = researcher.run(user_input)
    
    # Pipeline Step 2: Architecture Mapping
    architect_output = architect.run(research_output)
    
    # Pipeline Step 3: Drafting
    draft_output = writer.run(
        topic=user_input, 
        researcher_data=research_output, 
        architect_data=architect_output
    )
    
    # Pipeline Step 4: Review
    final_output = reviewer.run(draft_output)

    # Save output to Markdown file
    print(f"\n[System] Pipeline complete! Saving output to {output_filename}...")
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(final_output)
        print(f"[System] Success! {output_filename} created successfully.")
    except Exception as e:
        print(f"[System] Error writing to file: {e}")

if __name__ == "__main__":
    main()
