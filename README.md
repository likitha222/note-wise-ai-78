# NoteWise AI

Build a simple working web app called "NoteWise AI" — an AI-powered adaptive learning app that converts students' handwritten notes into study material and practice questions.

IMPORTANT — KEEP THE PROJECT SIMPLE

This is a college project prototype/MVP. Do NOT over-engineer it. just create a working demo

Priorities:

Simple clean UI

Working file upload

AI analysis of uploaded notes

Summary + mind map

AI-generated MCQ quiz

Basic adaptive difficulty based on answers

Avoid unnecessary features, complex animations, complicated authentication, payment systems, social features, or advanced ML models.

Use as few pages and components as possible to reduce complexity and API/AI usage.

1. TECH STACK

Use:

React

TypeScript

Tailwind CSS

Simple responsive design

Supabase only if a database is actually required

OpenAI API for AI processing

Do not add unnecessary libraries.

2. MAIN APP FLOW

The entire application should follow this simple flow:

UPLOAD NOTES
↓
AI ANALYSIS
↓
SUMMARY + MIND MAP
↓
START QUIZ
↓
ANSWER QUESTIONS
↓
PERFORMANCE RESULT
↓
RECOMMENDED PRACTICE

Keep this flow obvious to the user.

3. HOME / DASHBOARD

Create one clean dashboard.

Header:

NoteWise AI
"Turn your notes into personalized practice."

Main section 1:

Upload Your Notes

Create a small-medium drag-and-drop box:

Drop your files here

or

Browse Files

Accept:

PDF

PNG

JPG

JPEG

Show a small note:

"Upload handwritten or typed study notes."

After selecting a file, show:

File name

File size

Remove button

Analyze Notes button

Do NOT automatically call the AI immediately after file selection.

Only call the AI when the user clicks Analyze Notes.

This reduces unnecessary API usage.

4. FILE UPLOAD

The upload must actually work.

The user should be able to:

Drag a file into the box

Click Browse Files

Select a PDF/image

See the selected file

Remove the file

Start analysis

Show a simple progress state:

Analyzing your notes...

Then:

✓ Notes analyzed

Do not create a complicated multi-step upload wizard.

5. AI NOTE ANALYSIS

When the user clicks Analyze Notes, send the uploaded notes to the OpenAI API.

The AI should perform these tasks in ONE request where possible:

Extract important information from the notes

Create a short summary

Identify important topics

Create a simple mind-map structure

Identify concepts suitable for quiz questions

Do NOT make separate AI API calls for each of these tasks.

Return structured JSON.

Example structure:

{
  "title": "Operating Systems",
  "summary": "Short summary of the notes...",
  "topics": [
    "Process Management",
    "CPU Scheduling",
    "Memory Management"
  ],
  "mindmap": {
    "name": "Operating Systems",
    "children": [
      {
        "name": "Process Management",
        "children": [
          {"name": "Process"},
          {"name": "PCB"},
          {"name": "Process States"}
        ]
      }
    ]
  },
  "quiz_topics": [
    "Process",
    "PCB",
    "Process States",
    "CPU Scheduling"
  ]
}

Keep the summary concise.

6. RESULTS PAGE

After analysis, show three simple sections on the same page.

Summary

Display:

AI Summary

Show the generated summary in an easy-to-read card.

Add:

Key Topics

Display topics as small cards/tags.

Mind Map

Display a simple visual mind map using the returned topic hierarchy.

It does NOT need to be highly sophisticated.

Example:

              Operating Systems
                      |
       -------------------------------
       |              |              |
    Process        Scheduling      Memory
       |
   Process States

Keep the mind map clean and readable.

Start Quiz

Show:

Ready to practice?

Button:

Start Adaptive Quiz

7. QUIZ

Create a simple MCQ interface.

Show one question at a time.

Example:

Question 1 of 10

What is a process?

A. A program in execution
B. A type of memory
C. A hardware device
D. A compiler

Allow the student to select one answer.

Button:

Next

Do not show all 10 questions at once.

8. AI QUESTION GENERATION

Generate the quiz from the uploaded notes.

Generate approximately 10 MCQs in ONE AI request, not one API request per question.

Each question should contain:

{
  "question": "What is a process?",
  "options": [
    "A program in execution",
    "A memory location",
    "A hardware device",
    "A programming language"
  ],
  "answer": 0,
  "difficulty": "easy",
  "topic": "Process Management",
  "explanation": "A process is a program currently in execution."
}

Questions must be based ONLY on the uploaded notes.

Avoid questions about information that is not present in the notes.

Use:

4 options

1 correct answer

short explanation

topic

difficulty

Difficulty levels:

easy
medium
hard

9. ADAPTIVE QUIZ LOGIC

Keep adaptive learning simple.

Do NOT build machine learning for this prototype.

Use a basic rule-based system.

Start with easy/medium questions.

After each answer:

Correct answer → increase difficulty

Incorrect answer → keep the same difficulty or reduce it

Example:

Correct → Easy → Medium
Correct → Medium → Hard

Wrong → Medium → Easy
Wrong → Hard → Medium

Also track which topic the student gets wrong.

At the end, identify the weakest topic based on incorrect answers.

10. QUIZ RESULT

After the quiz, show:

Quiz Complete!

Example:

Score: 7 / 10

70%

Then show:

Strong Topics

Process Management

Memory Management

Needs Practice

CPU Scheduling

AI Recommendation

"Practice 3–5 more questions on CPU Scheduling."

Add buttons:

Try Weak Topic Again

Back to Notes

11. WEAK TOPIC PRACTICE

When the user clicks:

Try Weak Topic Again

Generate a small set of 5 questions focused on the weakest topic.

Keep this simple.

Do not generate another complete analysis of the notes.

Use the already extracted notes/topics from the first AI analysis.

12. UI DESIGN

Make the interface:

Minimal

Modern

Student-friendly

Clean

Responsive

Easy to understand

Use:

White/light background

One primary accent color

Rounded cards

Simple icons

Clear buttons

Plenty of spacing

Avoid:

Excessive animations

3D effects

Complex gradients

Huge navigation menus

Unnecessary dashboards

Too many pages

The app should feel like a simple student study tool.

13. NAVIGATION

Keep navigation extremely small.

Header:

NoteWise AI

Navigation:

Home

My Notes

Progress

However, if these pages are not necessary for the MVP, keep everything on a single-page application.

Do NOT create unnecessary pages.

14. PROGRESS

Add a simple progress section.

Show:

Overall Quiz Accuracy

Example:

72%

Then:

Strong Topics
████████░░ 80%

Needs Practice
████░░░░░░ 40%

This can be stored locally using browser localStorage for the prototype.

Do NOT build a complicated backend database unless necessary.

15. AI API USAGE — IMPORTANT

Optimize AI usage to reduce API calls and cost.

Use:

First AI call:

Analyze notes + summary + topics + mind map + quiz topics.

Second AI call:

Generate 10 quiz questions.

Additional AI call:

Only when the user requests weak-topic practice.

Do NOT call the AI:

Every time a page loads

Every time a question is displayed

Every time an answer is selected

For simple score calculations

For difficulty calculations

Use normal JavaScript for:

Score calculation

Difficulty adjustment

Progress calculation

Weak-topic detection

16. ERROR HANDLING

If the AI cannot read the uploaded file, show:

"Sorry, we couldn't read these notes. Please upload a clearer image or PDF."

If the file type is unsupported:

"Please upload a PDF, JPG, PNG, or JPEG file."

If the API fails:

"Something went wrong while analyzing your notes. Please try again."

Do not expose API keys or technical error messages to the student.

17. API KEY SECURITY

Never expose the OpenAI API key in frontend code.

Use a secure backend/server-side function or Supabase Edge Function to call OpenAI.

The frontend should communicate with the backend function.

18. DEMO / FALLBACK MODE

VERY IMPORTANT FOR THE COLLEGE PROTOTYPE:

Create a Demo Mode using sample notes.

If the OpenAI API is not configured, the application should still demonstrate the complete interface using sample data.

Sample subject:

Operating Systems

Sample data should include:

Summary

Topics

Mind map

10 MCQs

Answers

Difficulty

Explanations

Add a small:

Try Demo

button.

This allows the prototype to work during a presentation even if the API is temporarily unavailable.

19. SAMPLE DEMO FLOW

When the user clicks Try Demo:

Load:

Operating Systems

Then display:

Summary → Mind Map → Quiz → Result → Weak Topic Practice.

The demo should not require an OpenAI API call.

20. FINAL REQUIREMENT

Build the application as a working MVP, not just a visual mockup.

The following must work:

✓ Drag-and-drop file upload
✓ File selection
✓ File removal
✓ AI note analysis
✓ Summary generation
✓ Topic extraction
✓ Mind map generation
✓ AI MCQ generation
✓ Quiz interaction
✓ Score calculation
✓ Adaptive difficulty
✓ Weak-topic detection
✓ Weak-topic practice
✓ Progress display
✓ Demo mode

Keep the code simple and modular.

Prioritize functionality over visual complexity.

Do not add features that are not requested above.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://note-wise-ai-78.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8c1df13-3144-4f3a-98c9-5de1e3cbdf0e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
