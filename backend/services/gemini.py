"""
AI service — powered by Groq (groq.com).

Groq offers a completely FREE API with generous rate limits using
ultra-fast LPU (Language Processing Unit) inference.

Groq API docs : https://console.groq.com/docs
Base URL       : https://api.groq.com/openai/v1
SDK            : groq  (pip install groq)
Default model  : llama-3.3-70b-versatile  (free, smart, very fast)

Get your FREE key at: https://console.groq.com/keys
"""

import json
import os
from typing import List, Optional
from groq import Groq

_client: Optional[Groq] = None

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def _get_client() -> Groq:
    """Lazy-init the Groq client."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not set. "
                "Get a free key at https://console.groq.com/keys"
            )
        _client = Groq(api_key=api_key)
    return _client


def _chat(prompt: str, temperature: float = 0.7) -> str:
    """Single-turn chat completion. Returns raw text."""
    client = _get_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )
    return response.choices[0].message.content or ""


def _safe_json(text: str):
    """Strip markdown fences and parse JSON safely."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1]).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


# ── Public AI functions ────────────────────────────────────────────────


async def generate_interview_questions(
    role: str,
    difficulty: str,
    num_questions: int,
    previous_qa: Optional[List[dict]] = None,
    resume_text: Optional[str] = None,
) -> List[dict]:
    """Generate adaptive interview questions using Groq."""

    context = ""
    if previous_qa:
        context = "\n\nPrevious Q&A context (adapt questions based on this):\n"
        for qa in previous_qa[-3:]:
            context += f"Q: {qa['question']}\nA: {qa['answer']}\n\n"

    resume_context = ""
    if resume_text:
        resume_context = (
            f"\n\nCandidate Resume:\n{resume_text[:2000]}\n\n"
            "Tailor questions specifically to this candidate's background."
        )

    prompt = f"""You are an expert technical interviewer at a top tech company.

Generate exactly {num_questions} interview questions for a {role} position at {difficulty} level.
{context}{resume_context}

Return ONLY a valid JSON array — no explanation, no markdown, no preamble:
[
  {{
    "question_text": "Your question here",
    "question_type": "technical|behavioral|hr|situational",
    "ideal_answer_hints": "Key points a great answer should cover"
  }}
]

Mix types proportionally:
- technical   : role-specific technical depth
- behavioral  : STAR-method situational experience
- hr          : culture fit, goals, expectations
- situational : hypothetical problem-solving

Difficulty calibration:
- Beginner    : fundamentals, definitions, simple tasks
- Intermediate: real-world applications, trade-offs, patterns
- Advanced    : system design, architecture, leadership, optimisation

Return ONLY the raw JSON array."""

    try:
        raw = _chat(prompt, temperature=0.8)
        parsed = _safe_json(raw)
        if isinstance(parsed, list) and parsed:
            return parsed
    except Exception as e:
        print(f"[Groq] question generation error: {e}")

    fallback_pool = [
        {
            "question_text": f"Tell me about your experience as a {role}.",
            "question_type": "behavioral",
            "ideal_answer_hints": "Should cover experience, projects, and impact",
        },
        {
            "question_text": f"What technical skills make you a strong fit for a {role} role?",
            "question_type": "technical",
            "ideal_answer_hints": "Should reference specific tools, languages, or frameworks relevant to the role",
        },
        {
            "question_text": "Describe a challenging problem you solved and how you approached it.",
            "question_type": "situational",
            "ideal_answer_hints": "Should follow a clear problem → approach → result structure",
        },
        {
            "question_text": "Why are you interested in this position and our company?",
            "question_type": "hr",
            "ideal_answer_hints": "Should show genuine interest and alignment with the role",
        },
        {
            "question_text": "How do you stay up to date with industry trends and new technologies?",
            "question_type": "behavioral",
            "ideal_answer_hints": "Should mention concrete learning habits or resources",
        },
    ]
    # Cycle through the pool so we always return exactly num_questions items,
    # even if more are requested than the pool contains.
    return [fallback_pool[i % len(fallback_pool)] for i in range(num_questions)]


async def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    difficulty: str,
    question_type: str,
    ideal_hints: str,
) -> dict:
    """Evaluate a candidate's answer using Groq."""

    prompt = f"""You are a senior interviewer evaluating a candidate for a {role} position.

Question type : {question_type}
Question      : {question}
Candidate's answer: {answer}
Ideal answer hints: {ideal_hints}

Score the answer and return ONLY a valid JSON object — no markdown, no extra text:
{{
  "accuracy_score"     : <integer 0-100>,
  "clarity_score"      : <integer 0-100>,
  "depth_score"        : <integer 0-100>,
  "communication_score": <integer 0-100>,
  "confidence_score"   : <integer 0-100>,
  "overall_score"      : <integer 0-100>,
  "feedback"           : "2-4 sentences of specific, constructive feedback",
  "strengths_shown"    : ["specific strength 1", "specific strength 2"],
  "areas_to_improve"   : ["specific improvement 1", "specific improvement 2"]
}}

Scoring guide:
- accuracy_score      : factual correctness and relevance to the question
- clarity_score       : how clear, structured and easy to follow the answer is
- depth_score         : technical depth and level of detail
- communication_score : professional language, grammar, presentation
- confidence_score    : assertiveness and conviction demonstrated
- overall_score       : holistic weighted score across all criteria

Be honest and critical — a poor answer should score below 50.
Return ONLY the raw JSON object."""

    try:
        raw = _chat(prompt, temperature=0.3)
        result = _safe_json(raw)
        if isinstance(result, dict) and "overall_score" in result:
            return result
    except Exception as e:
        print(f"[Groq] evaluation error: {e}")

    return {
        "accuracy_score": 50, "clarity_score": 50, "depth_score": 50,
        "communication_score": 50, "confidence_score": 50, "overall_score": 50,
        "feedback": "Answer received. Keep practising for better results.",
        "strengths_shown": [], "areas_to_improve": ["Provide more detailed answers"],
    }


async def generate_interview_report(
    role: str,
    difficulty: str,
    questions_and_answers: List[dict],
    scores: dict,
) -> dict:
    """Generate a comprehensive interview feedback report using Groq."""

    qa_summary = "\n".join(
        f"Q{i+1} [{qa['type']}]: {qa['question']}\n"
        f"Answer: {qa['answer'][:200]}...\nScore: {qa['score']}/100"
        for i, qa in enumerate(questions_and_answers)
    )

    prompt = f"""You are a senior career coach reviewing a completed mock interview.

Role: {role} | Difficulty: {difficulty}
Overall Score: {scores.get('overall', 0):.1f}/100
Technical Score: {scores.get('technical', 0):.1f}/100
Communication Score: {scores.get('communication', 0):.1f}/100

Interview Summary:
{qa_summary}

Generate a detailed feedback report. Return ONLY a valid JSON object — no markdown, no extra text:
{{
  "strengths"          : ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses"         : ["specific weakness 1", "specific weakness 2", "specific weakness 3"],
  "missed_concepts"    : ["concept 1", "concept 2", "concept 3"],
  "recommended_topics" : ["topic 1", "topic 2", "topic 3", "topic 4"],
  "improvement_plan"   : "A detailed 3-4 sentence improvement plan with concrete action items the candidate can start today"
}}

Be specific and actionable — reference actual answers where possible.
Return ONLY the raw JSON object."""

    try:
        raw = _chat(prompt, temperature=0.4)
        result = _safe_json(raw)
        if isinstance(result, dict) and "strengths" in result:
            return result
    except Exception as e:
        print(f"[Groq] report generation error: {e}")

    return {
        "strengths": ["Attempted all questions", "Showed effort"],
        "weaknesses": ["Need more technical depth", "Practice structured responses"],
        "missed_concepts": ["Core fundamentals"],
        "recommended_topics": ["Data structures", "System design"],
        "improvement_plan": (
            "Focus on practising technical fundamentals and use the STAR method for behavioural questions."
        ),
    }


async def generate_coach_plan(
    user_data: dict,
    interview_history: List[dict],
) -> dict:
    """Generate a personalised 8-week career coaching plan using Groq."""

    history_summary = (
        "\n".join(
            f"- {i['role']} ({i['difficulty']}): {i['score']}/100"
            for i in interview_history[-10:]
        )
        or "No interview history yet."
    )

    prompt = f"""You are an elite career coach building a personalised interview prep plan.

Candidate Profile:
- Total Interviews Completed: {user_data.get('total_interviews', 0)}
- Average Score            : {user_data.get('avg_score', 0):.1f}/100
- Target Roles             : {user_data.get('roles', ['Software Engineer'])}

Recent Interview History:
{history_summary}

Generate a personalised career coaching plan. Return ONLY a valid JSON object — no markdown, no extra text:
{{
  "weekly_plan": [
    {{"day": "Monday",    "tasks": ["task 1", "task 2"], "duration": "2 hours",   "focus": "focus area"}},
    {{"day": "Tuesday",   "tasks": ["task 1", "task 2"], "duration": "1.5 hours", "focus": "focus area"}},
    {{"day": "Wednesday", "tasks": ["task 1", "task 2"], "duration": "2 hours",   "focus": "focus area"}},
    {{"day": "Thursday",  "tasks": ["task 1", "task 2"], "duration": "1 hour",    "focus": "focus area"}},
    {{"day": "Friday",    "tasks": ["task 1", "task 2"], "duration": "2 hours",   "focus": "focus area"}},
    {{"day": "Saturday",  "tasks": ["task 1"],           "duration": "3 hours",   "focus": "focus area"}},
    {{"day": "Sunday",    "tasks": ["task 1"],           "duration": "1 hour",    "focus": "review & rest"}}
  ],
  "recommended_skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
  "learning_roadmap": [
    {{"phase": "Phase 1 (Week 1-2)", "title": "Foundation",      "topics": ["topic 1", "topic 2"], "resources": ["resource 1"]}},
    {{"phase": "Phase 2 (Week 3-4)", "title": "Core Skills",     "topics": ["topic 1", "topic 2"], "resources": ["resource 1"]}},
    {{"phase": "Phase 3 (Week 5-6)", "title": "Advanced Topics", "topics": ["topic 1"],            "resources": ["resource 1"]}},
    {{"phase": "Phase 4 (Week 7-8)", "title": "Mock Interviews", "topics": ["practice", "review"], "resources": ["resource 1"]}}
  ],
  "preparation_strategy": "A detailed 4-5 sentence strategy covering daily habits, focus areas, mock interview frequency, and mindset guidance."
}}

Tailor everything to the candidate's actual history and target roles.
Return ONLY the raw JSON object."""

    try:
        raw = _chat(prompt, temperature=0.6)
        result = _safe_json(raw)
        if isinstance(result, dict) and "weekly_plan" in result:
            return result
    except Exception as e:
        print(f"[Groq] coach plan error: {e}")

    return {
        "weekly_plan": [
            {"day": d, "tasks": ["Practice coding", "Review concepts"],
             "duration": "2 hours", "focus": "Fundamentals"}
            for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        ],
        "recommended_skills": ["Data Structures", "System Design", "Communication", "Problem Solving", "Leadership"],
        "learning_roadmap": [
            {"phase": "Phase 1 (Week 1-2)", "title": "Foundation",  "topics": ["Arrays", "Strings"],  "resources": ["LeetCode"]},
            {"phase": "Phase 2 (Week 3-4)", "title": "Core Skills", "topics": ["System Design"],      "resources": ["Grokking"]},
        ],
        "preparation_strategy": "Focus on consistent daily practice. Aim for 2-3 mock interviews per week and review feedback thoroughly.",
    }


async def generate_resume_questions(
    resume_text: str,
    role: str,
    num_questions: int,
) -> List[dict]:
    """Generate resume-personalised interview questions using Groq."""

    prompt = f"""Analyse this resume and generate exactly {num_questions} highly personalised interview questions for a {role} position.

Resume:
{resume_text[:3000]}

Return ONLY a valid JSON array — no markdown, no extra text:
[
  {{
    "question_text"     : "A specific question referencing their actual resume content",
    "question_type"     : "technical|behavioral|situational",
    "ideal_answer_hints": "What a strong answer should include"
  }}
]

Focus on:
1. Specific projects and technologies mentioned
2. Career transitions or gaps worth exploring
3. Claimed skills that need validation
4. Achievements and quantified impact
5. Team and leadership experiences

Return ONLY the raw JSON array."""

    try:
        raw = _chat(prompt, temperature=0.8)
        parsed = _safe_json(raw)
        if isinstance(parsed, list) and parsed:
            return parsed
    except Exception as e:
        print(f"[Groq] resume question error: {e}")

    return await generate_interview_questions(
        role, "intermediate", num_questions, resume_text=resume_text
    )
