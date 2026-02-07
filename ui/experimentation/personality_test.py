#!/usr/bin/env python3
"""
MBTI-Style Personality Test
A simple CLI tool to determine your personality type based on the MBTI framework.
"""

import sys

# Questions for each dimension
# Format: (question, dimension, direction)
# dimension: EI, SN, TF, JP, AT (Assertive/Turbulent)
# direction: 1 = first letter (E, S, T, J, A), -1 = second letter (I, N, F, P, T)

QUESTIONS = [
    # Extraversion (E) vs Introversion (I) - 11 questions
    ("You feel comfortable just walking up to someone you find interesting and striking up a conversation.", "EI", 1),
    ("You rarely worry about whether you make a good impression on people you meet.", "EI", 1),
    ("You enjoy participating in team-based activities.", "EI", 1),
    ("You enjoy solitary hobbies or activities more than group ones.", "EI", -1),
    ("You usually wait for others to introduce themselves first at social gatherings.", "EI", -1),
    ("You usually prefer to be around others rather than on your own.", "EI", 1),
    ("Your friends would describe you as lively and outgoing.", "EI", 1),
    ("You avoid making phone calls.", "EI", -1),
    ("You can easily connect with people you have just met.", "EI", 1),
    ("You would love a job that requires you to work alone most of the time.", "EI", -1),
    ("You feel more drawn to busy, bustling atmospheres than to quiet, intimate places.", "EI", 1),

    # Sensing (S) vs Intuition (N) - 11 questions
    ("You are not too interested in discussions about various interpretations of creative works.", "SN", 1),
    ("You enjoy experimenting with new and untested approaches.", "SN", -1),
    ("You actively seek out new experiences and knowledge areas to explore.", "SN", -1),
    ("You cannot imagine yourself writing fictional stories for a living.", "SN", 1),
    ("You become bored or lose interest when the discussion gets highly theoretical.", "SN", 1),
    ("You are drawn to various forms of creative expression, such as writing.", "SN", -1),
    ("You enjoy exploring unfamiliar ideas and viewpoints.", "SN", -1),
    ("You are not too interested in discussing theories on what the world could look like in the future.", "SN", 1),
    ("You believe that pondering abstract philosophical questions is a waste of time.", "SN", 1),
    ("You prefer tasks that require you to come up with creative solutions rather than follow concrete steps.", "SN", -1),
    ("You enjoy debating ethical dilemmas.", "SN", -1),

    # Thinking (T) vs Feeling (F) - 11 questions
    ("People's stories and emotions speak louder to you than numbers or data.", "TF", -1),
    ("You prioritize facts over people's feelings when determining a course of action.", "TF", 1),
    ("You prioritize being sensitive over being completely honest.", "TF", -1),
    ("You favor efficiency in decisions, even if it means disregarding some emotional aspects.", "TF", 1),
    ("In disagreements, you prioritize proving your point over preserving the feelings of others.", "TF", 1),
    ("You are not easily swayed by emotional arguments.", "TF", 1),
    ("When facts and feelings conflict, you usually find yourself following your heart.", "TF", -1),
    ("You usually base your choices on objective facts rather than emotional impressions.", "TF", 1),
    ("When making decisions, you focus more on how the affected people might feel than on what is most logical or efficient.", "TF", -1),
    ("If a decision feels right to you, you often act on it without needing further proof.", "TF", -1),
    ("You are more likely to rely on emotional intuition than logical reasoning when making a choice.", "TF", -1),

    # Judging (J) vs Perceiving (P) - 11 questions
    ("You prioritize and plan tasks effectively, often completing them well before the deadline.", "JP", 1),
    ("You like to use organizing tools like schedules and lists.", "JP", 1),
    ("You often allow the day to unfold without any schedule at all.", "JP", -1),
    ("You prefer to do your chores before allowing yourself to relax.", "JP", 1),
    ("You often end up doing things at the last possible moment.", "JP", -1),
    ("You find it challenging to maintain a consistent work or study schedule.", "JP", -1),
    ("You like to have a to-do list for each day.", "JP", 1),
    ("If your plans are interrupted, your top priority is to get back on track as soon as possible.", "JP", 1),
    ("Your personal work style is closer to spontaneous bursts of energy than organized and consistent efforts.", "JP", -1),
    ("You complete things methodically without skipping over any steps.", "JP", 1),
    ("You struggle with deadlines.", "JP", -1),

    # Assertive (A) vs Turbulent (T) - 10 questions
    ("Even a small mistake can cause you to doubt your overall abilities and knowledge.", "AT", -1),
    ("You are prone to worrying that things will take a turn for the worse.", "AT", -1),
    ("Your mood can change very quickly.", "AT", -1),
    ("You rarely second-guess the choices that you have made.", "AT", 1),
    ("You rarely feel insecure.", "AT", 1),
    ("You are still bothered by mistakes that you made a long time ago.", "AT", -1),
    ("Your emotions control you more than you control them.", "AT", -1),
    ("When someone thinks highly of you, you wonder how long it will take them to feel disappointed in you.", "AT", -1),
    ("You often feel overwhelmed.", "AT", -1),
    ("You feel confident that things will work out for you.", "AT", 1),
]

# Personality type descriptions
PERSONALITY_DESCRIPTIONS = {
    "INTJ": "The Architect - Strategic, innovative, and independent thinkers with a plan for everything.",
    "INTP": "The Logician - Innovative inventors with an unquenchable thirst for knowledge.",
    "ENTJ": "The Commander - Bold, imaginative, and strong-willed leaders who find a way or make one.",
    "ENTP": "The Debater - Smart and curious thinkers who love intellectual challenges.",
    "INFJ": "The Advocate - Quiet and mystical, yet inspiring and idealistic.",
    "INFP": "The Mediator - Poetic, kind, and altruistic, always eager to help a good cause.",
    "ENFJ": "The Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners.",
    "ENFP": "The Campaigner - Enthusiastic, creative, and sociable free spirits.",
    "ISTJ": "The Logistician - Practical and fact-minded, reliable and dependable.",
    "ISFJ": "The Defender - Dedicated and warm protectors, always ready to defend loved ones.",
    "ESTJ": "The Executive - Excellent administrators, unsurpassed at managing things and people.",
    "ESFJ": "The Consul - Extraordinarily caring, social, and popular people, always eager to help.",
    "ISTP": "The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.",
    "ISFP": "The Adventurer - Flexible and charming artists, always ready to explore and experience something new.",
    "ESTP": "The Entrepreneur - Smart, energetic, and perceptive, living on the edge.",
    "ESFP": "The Entertainer - Spontaneous, energetic, and enthusiastic people who love life around them.",
}


def display_welcome():
    """Display welcome message."""
    print("\n" + "="*70)
    print(" "*20 + "PERSONALITY TEST")
    print("="*70)
    print("\nThis test will help you discover your personality type.")
    print("You'll be asked 54 questions. Answer honestly for the best results.")
    print("\nFor each statement, indicate how much you agree:")
    print("  1 - Strongly Disagree")
    print("  2 - Disagree")
    print("  3 - Neutral")
    print("  4 - Agree")
    print("  5 - Strongly Agree")
    print("\n" + "="*70 + "\n")


def get_response(question_num, question_text, total_questions):
    """Get user response for a question."""
    while True:
        print(f"\nQuestion {question_num}/{total_questions}:")
        print(f"  {question_text}")
        try:
            response = input("Your answer (1-5): ").strip()
            score = int(response)
            if 1 <= score <= 5:
                return score
            else:
                print("Please enter a number between 1 and 5.")
        except ValueError:
            print("Invalid input. Please enter a number between 1 and 5.")
        except KeyboardInterrupt:
            print("\n\nTest cancelled.")
            sys.exit(0)


def calculate_personality_type(scores):
    """Calculate personality type from scores."""
    personality_type = ""

    # E vs I
    if scores["EI"] >= 0:
        personality_type += "E"
    else:
        personality_type += "I"

    # S vs N
    if scores["SN"] >= 0:
        personality_type += "S"
    else:
        personality_type += "N"

    # T vs F
    if scores["TF"] >= 0:
        personality_type += "T"
    else:
        personality_type += "F"

    # J vs P
    if scores["JP"] >= 0:
        personality_type += "J"
    else:
        personality_type += "P"

    # A vs T (Assertive vs Turbulent)
    if scores["AT"] >= 0:
        personality_type += "-A"
    else:
        personality_type += "-T"

    return personality_type


def display_results(personality_type, scores):
    """Display test results."""
    print("\n" + "="*70)
    print(" "*25 + "YOUR RESULTS")
    print("="*70)
    print(f"\nYour personality type is: {personality_type}")

    # Get base type (without -A/-T suffix) for description
    base_type = personality_type.split("-")[0]
    print(f"\n{PERSONALITY_DESCRIPTIONS[base_type]}")

    # Add Assertive/Turbulent description
    if personality_type.endswith("-A"):
        print("\nAssertive: Confident, emotionally stable, and resistant to stress.")
    else:
        print("\nTurbulent: Self-conscious, sensitive to stress, and success-driven.")

    print("\n" + "-"*70)
    print("Dimension Breakdown:")
    print("-"*70)

    # Calculate percentages (normalized to show strength of preference)
    # Score range is approximately -50 to +50 per dimension
    # Convert to 0-100 percentage
    def calculate_percentage(score, num_questions):
        max_score = num_questions * 10  # 10 points per question max
        return min(100, max(0, int((abs(score) / max_score) * 100)))

    ei_pct = calculate_percentage(scores["EI"], 11)
    sn_pct = calculate_percentage(scores["SN"], 11)
    tf_pct = calculate_percentage(scores["TF"], 11)
    jp_pct = calculate_percentage(scores["JP"], 11)
    at_pct = calculate_percentage(scores["AT"], 10)

    dimensions = [
        ("Extraversion (E)" if scores["EI"] >= 0 else "Introversion (I)", ei_pct),
        ("Sensing (S)" if scores["SN"] >= 0 else "Intuition (N)", sn_pct),
        ("Thinking (T)" if scores["TF"] >= 0 else "Feeling (F)", tf_pct),
        ("Judging (J)" if scores["JP"] >= 0 else "Perceiving (P)", jp_pct),
        ("Assertive (A)" if scores["AT"] >= 0 else "Turbulent (T)", at_pct),
    ]

    for dim, pct in dimensions:
        bar_length = int(pct / 2)
        bar = "█" * bar_length
        print(f"{dim:20} [{bar:50}] {pct}%")

    print("\n" + "="*70 + "\n")


def run_test():
    """Main test execution."""
    display_welcome()

    # Initialize scores for each dimension
    scores = {
        "EI": 0,  # Extraversion vs Introversion
        "SN": 0,  # Sensing vs Intuition
        "TF": 0,  # Thinking vs Feeling
        "JP": 0,  # Judging vs Perceiving
        "AT": 0,  # Assertive vs Turbulent
    }

    # Ask all questions
    total_questions = len(QUESTIONS)
    for i, (question, dimension, direction) in enumerate(QUESTIONS, 1):
        response = get_response(i, question, total_questions)
        # Convert 1-5 scale to -10 to +10 scale
        # 1 = strongly disagree (-10), 3 = neutral (0), 5 = strongly agree (+10)
        score = (response - 3) * 5 * direction
        scores[dimension] += score

    # Calculate personality type
    personality_type = calculate_personality_type(scores)

    # Display results
    display_results(personality_type, scores)


if __name__ == "__main__":
    try:
        run_test()
    except KeyboardInterrupt:
        print("\n\nTest cancelled. Goodbye!")
        sys.exit(0)
