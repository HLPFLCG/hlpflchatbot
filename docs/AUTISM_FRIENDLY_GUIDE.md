# HLPFL Chatbot Setup Guide
## A Step-by-Step Guide for Everyone

**Time to Complete:** 2-4 hours  
**Difficulty Level:** Beginner to Intermediate  
**What You'll Learn:** How to set up, customize, and deploy the HLPFL chatbot

---

## Table of Contents
1. [What This Guide Is](#what-this-guide-is)
2. [Before You Start](#before-you-start)
3. [Understanding the Chatbot](#understanding-the-chatbot)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Customization Guide](#customization-guide)
6. [Deployment Instructions](#deployment-instructions)
7. [Troubleshooting](#troubleshooting)
8. [Glossary of Terms](#glossary-of-terms)

---

## What This Guide Is

This guide will teach you how to:
- Set up the HLPFL chatbot on your computer
- Customize the chatbot for your needs
- Deploy the chatbot to the internet
- Fix common problems

**Important:** This guide uses clear, direct language. There are no idioms or unclear phrases.

---

## Before You Start

### What You Need

**Required Items:**
- [ ] A computer (Windows, Mac, or Linux)
- [ ] Internet connection
- [ ] A Cloudflare account (free - we'll create this together)
- [ ] A GitHub account (free - we'll create this together)
- [ ] 2-4 hours of uninterrupted time

**Optional But Helpful:**
- [ ] A text editor (VS Code is recommended - it's free)
- [ ] Basic knowledge of using a computer
- [ ] Patience (this is a learning process)

### Creating Required Accounts

#### Step 1: Create a GitHub Account
**Time:** 5 minutes

1. Go to https://github.com
2. Click the "Sign up" button (top right corner)
3. Enter your email address
4. Click "Continue"
5. Create a password (write it down somewhere safe)
6. Click "Continue"
7. Choose a username (this will be public)
8. Click "Continue"
9. Complete the verification puzzle
10. Check your email for a verification code
11. Enter the code
12. Your GitHub account is now created

**What is GitHub?** GitHub is a website where people store and share code. Think of it like Google Drive, but specifically for computer code.

#### Step 2: Create a Cloudflare Account
**Time:** 5 minutes

1. Go to https://cloudflare.com
2. Click "Sign up" (top right corner)
3. Enter your email address
4. Create a password (write it down somewhere safe)
5. Click "Create Account"
6. Check your email for a verification link
7. Click the verification link
8. Your Cloudflare account is now created

**What is Cloudflare?** Cloudflare is a service that helps websites run faster and more securely. We use it to host the chatbot.

---

## Understanding the Chatbot

### What is a Chatbot?

A chatbot is a computer program that can have conversations with people. It answers questions automatically.

**Example:**
- User types: "What services do you offer?"
- Chatbot responds: "HLPFL Records offers artist development, music production, distribution, and more!"

### How This Chatbot Works

```
User types message → Chatbot reads message → Chatbot finds answer → Chatbot sends response
```

**The chatbot has three main parts:**

1. **The Brain (worker.js)**
   - This file contains the logic
   - It decides what to say
   - It reads the knowledge base

2. **The Face (chat-widget.js and chat-widget.css)**
   - This is what users see
   - It includes the chat window
   - It includes colors and styling

3. **The Knowledge (knowledge-base folder)**
   - This contains all the information
   - It includes company details
   - It includes answers to questions

---

## Step-by-Step Setup

### Part 1: Getting the Code
**Time:** 10 minutes

#### Step 1.1: Open Your Terminal/Command Prompt

**On Windows:**
1. Press the Windows key
2. Type "cmd"
3. Press Enter
4. A black window will open - this is your terminal

**On Mac:**
1. Press Command + Space
2. Type "terminal"
3. Press Enter
4. A white or black window will open - this is your terminal

**On Linux:**
1. Press Ctrl + Alt + T
2. A terminal window will open

**What is a terminal?** A terminal is a way to give your computer text commands. Instead of clicking buttons, you type instructions.

#### Step 1.2: Download the Code

**Type these commands exactly as shown. Press Enter after each line.**

```bash
cd Desktop
```
**What this does:** Moves to your Desktop folder

```bash
git clone https://github.com/HLPFLCG/hlpflchatbot.git
```
**What this does:** Downloads the chatbot code to your computer

**Expected result:** You will see text showing the download progress. When it's done, you'll see "done" or similar.

```bash
cd hlpflchatbot
```
**What this does:** Moves into the chatbot folder

**Expected result:** Your terminal prompt will now show "hlpflchatbot" in the path.

#### Step 1.3: Verify the Download

```bash
ls
```
**What this does:** Lists all files in the current folder

**Expected result:** You should see files like:
- worker.js
- chat-widget.js
- chat-widget.css
- knowledge-base (folder)
- README.md

**If you don't see these files:** Go back to Step 1.2 and try again.

---

### Part 2: Installing Required Software
**Time:** 15 minutes

#### Step 2.1: Install Node.js

**What is Node.js?** Node.js is software that lets your computer run JavaScript code. The chatbot uses JavaScript.

**On Windows:**
1. Go to https://nodejs.org
2. Click the green button that says "LTS" (Long Term Support)
3. Wait for the download to finish
4. Double-click the downloaded file
5. Click "Next" through all the screens
6. Click "Install"
7. Wait for installation to complete
8. Click "Finish"

**On Mac:**
1. Go to https://nodejs.org
2. Click the green button that says "LTS"
3. Wait for the download to finish
4. Double-click the downloaded file
5. Follow the installation instructions
6. Enter your password when asked
7. Wait for installation to complete

**On Linux:**
```bash
sudo apt update
sudo apt install nodejs npm
```

#### Step 2.2: Verify Node.js Installation

**Type this command:**
```bash
node --version
```

**Expected result:** You should see a version number like "v20.10.0" or similar.

**If you see an error:** Node.js is not installed correctly. Go back to Step 2.1.

#### Step 2.3: Install Wrangler (Cloudflare Tool)

**Type this command:**
```bash
npm install -g wrangler
```

**What this does:** Installs the Wrangler tool, which helps deploy to Cloudflare.

**Expected result:** You will see installation progress. This may take 2-3 minutes.

**When it's done:** You'll see your terminal prompt again.

#### Step 2.4: Verify Wrangler Installation

**Type this command:**
```bash
wrangler --version
```

**Expected result:** You should see a version number like "3.x.x" or similar.

---

### Part 3: Configuring the Chatbot
**Time:** 20 minutes

#### Step 3.1: Open the Project in a Text Editor

**If you have VS Code:**
1. Open VS Code
2. Click "File" → "Open Folder"
3. Navigate to Desktop → hlpflchatbot
4. Click "Select Folder"

**If you don't have VS Code:**
1. You can use Notepad (Windows) or TextEdit (Mac)
2. Navigate to Desktop → hlpflchatbot
3. Open files one at a time

#### Step 3.2: Understanding the File Structure

```
hlpflchatbot/
├── worker.js              ← The brain (main logic)
├── chat-widget.js         ← The interface (what users see)
├── chat-widget.css        ← The styling (colors, fonts)
├── wrangler.toml          ← Configuration file
├── assets/
│   └── hlpfl-logo.svg     ← The logo
└── knowledge-base/        ← All the information
    ├── enhanced-company-info.json
    ├── artist-development.json
    ├── music-production.json
    ├── streaming-strategies.json
    ├── social-media-marketing.json
    └── music-business-legal.json
```

#### Step 3.3: Review Configuration File

**Open the file:** `wrangler.toml`

**You should see:**
```toml
name = "hlpfl-chatbot"
main = "worker.js"
compatibility_date = "2023-12-01"

[env.production]
routes = [
  { pattern = "hlpfl.io/api/*", zone_name = "hlpfl.io" }
]
```

**What each line means:**
- `name`: The name of your chatbot project
- `main`: The main file that runs the chatbot
- `compatibility_date`: The version of Cloudflare Workers to use
- `routes`: Where the chatbot will be accessible on the internet

**Do not change this file unless you know what you're doing.**

---

### Part 4: Testing Locally
**Time:** 10 minutes

#### Step 4.1: Start the Development Server

**In your terminal, type:**
```bash
wrangler dev
```

**What this does:** Starts a local version of the chatbot on your computer.

**Expected result:** You will see:
```
⛅️ wrangler 3.x.x
-------------------
⎔ Starting local server...
⎔ Ready on http://localhost:8787
```

**What this means:** The chatbot is now running on your computer at http://localhost:8787

#### Step 4.2: Test the Chatbot

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: http://localhost:8787
3. You should see a response from the chatbot

**Expected result:** You will see JSON data or a welcome message.

#### Step 4.3: Stop the Development Server

**When you're done testing:**
1. Go back to your terminal
2. Press Ctrl + C (Windows/Linux) or Command + C (Mac)
3. The server will stop

**Expected result:** You'll see your terminal prompt again.

---

## Customization Guide

### Changing Colors

**File to edit:** `chat-widget.css`

**Find this section (around line 6):**
```css
:root {
  --hlpfl-copper: #CD8B5C;
  --hlpfl-copper-dark: #B87A4D;
  --hlpfl-bg-dark: #1A1A1A;
}
```

**To change the main color:**
1. Find `--hlpfl-copper: #CD8B5C;`
2. Replace `#CD8B5C` with your color code
3. Save the file

**How to find color codes:**
- Go to https://htmlcolorcodes.com
- Pick a color you like
- Copy the code (it starts with #)
- Paste it in the CSS file

**Example:**
- Blue: `#0000FF`
- Red: `#FF0000`
- Green: `#00FF00`
- Purple: `#800080`

### Changing Company Information

**File to edit:** `knowledge-base/enhanced-company-info.json`

**Open the file and find:**
```json
{
  "company": {
    "name": "HLPFL Records",
    "tagline": "World-Class Record Label & Artist Development",
    "location": {
      "city": "Grand Rapids",
      "state": "Michigan"
    }
  }
}
```

**To change information:**
1. Find the text you want to change
2. Replace it with your information
3. Keep the quotation marks
4. Save the file

**Important rules:**
- Keep all quotation marks (")
- Keep all commas (,)
- Keep all brackets ({ and })
- Don't add or remove lines unless you know what you're doing

### Adding New Questions and Answers

**File to edit:** `knowledge-base/faqs.json`

**Format for a new question:**
```json
{
  "question": "Your question here?",
  "answer": "Your answer here.",
  "category": "general",
  "keywords": ["keyword1", "keyword2"]
}
```

**Example:**
```json
{
  "question": "What are your office hours?",
  "answer": "We're open Monday-Friday, 9 AM to 6 PM EST.",
  "category": "general",
  "keywords": ["hours", "open", "time", "schedule"]
}
```

---

## Deployment Instructions

### Part 1: Connecting to Cloudflare
**Time:** 10 minutes

#### Step 1.1: Login to Cloudflare via Terminal

**Type this command:**
```bash
wrangler login
```

**What happens:**
1. A web browser window will open
2. You'll see a Cloudflare login page
3. Log in with your Cloudflare account
4. Click "Allow" to give Wrangler permission
5. You'll see "Success!" in your browser
6. Close the browser window

**Expected result in terminal:** "Successfully logged in"

**If you see an error:** Make sure you created a Cloudflare account in the "Before You Start" section.

### Part 2: Creating API Token
**Time:** 5 minutes

#### Step 2.1: Generate API Token

1. Go to https://dash.cloudflare.com
2. Log in to your account
3. Click on your profile icon (top right)
4. Click "My Profile"
5. Click "API Tokens" (left sidebar)
6. Click "Create Token"
7. Find "Edit Cloudflare Workers" template
8. Click "Use template"
9. Scroll down and click "Continue to summary"
10. Click "Create Token"
11. **IMPORTANT:** Copy the token and save it somewhere safe
12. You will need this token for deployment

**What is an API token?** An API token is like a password that lets the chatbot talk to Cloudflare. Keep it secret and safe.

### Part 3: Deploying to Production
**Time:** 5 minutes

#### Step 3.1: Set Environment Variable

**On Windows:**
```bash
set CLOUDFLARE_API_TOKEN=your_token_here
```

**On Mac/Linux:**
```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

**Replace `your_token_here` with the actual token you copied.**

#### Step 3.2: Deploy the Chatbot

**Type this command:**
```bash
wrangler deploy --env production
```

**What happens:**
1. Wrangler uploads your code to Cloudflare
2. Cloudflare processes the code
3. The chatbot becomes live on the internet

**Expected result:**
```
✨ Successfully published your script to
   https://hlpfl.io/api/*
```

**This means:** Your chatbot is now live!

#### Step 3.3: Test the Live Chatbot

1. Open your web browser
2. Go to: https://hlpfl.io/api/health
3. You should see: `{"status": "healthy"}`

**If you see this:** Congratulations! Your chatbot is working!

**If you see an error:** Go to the Troubleshooting section below.

---

## Troubleshooting

### Problem: "Command not found" Error

**What this means:** Your computer doesn't recognize the command.

**Solution:**
1. Make sure you installed Node.js (Part 2, Step 2.1)
2. Close and reopen your terminal
3. Try the command again

**If still not working:**
1. Restart your computer
2. Try again

---

### Problem: "Permission denied" Error

**What this means:** Your computer is blocking the action.

**Solution on Windows:**
1. Right-click on Command Prompt
2. Click "Run as administrator"
3. Try the command again

**Solution on Mac/Linux:**
1. Add `sudo` before the command
2. Example: `sudo npm install -g wrangler`
3. Enter your password when asked

---

### Problem: Chatbot Not Responding

**Possible causes:**
1. The chatbot is not deployed
2. The API token is incorrect
3. There's an error in the code

**Solution:**
1. Check if deployment was successful
2. Look for error messages in the terminal
3. Verify your API token is correct
4. Try deploying again

---

### Problem: Colors Not Changing

**Possible causes:**
1. CSS file not saved
2. Browser cache showing old version

**Solution:**
1. Make sure you saved the CSS file
2. Clear your browser cache:
   - Chrome: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Select "Cached images and files"
   - Click "Clear data"
3. Refresh the page (F5 or Cmd+R)

---

### Problem: JSON Syntax Error

**What this means:** There's a mistake in a JSON file.

**Common mistakes:**
- Missing comma
- Missing quotation mark
- Extra comma at the end
- Missing bracket

**Solution:**
1. Use a JSON validator: https://jsonlint.com
2. Copy your JSON code
3. Paste it into the validator
4. It will show you where the error is
5. Fix the error
6. Save the file

---

## Glossary of Terms

**API (Application Programming Interface)**
- A way for different computer programs to talk to each other
- Example: The chatbot uses an API to send and receive messages

**Browser**
- A program you use to view websites
- Examples: Chrome, Firefox, Safari, Edge

**CLI (Command Line Interface)**
- A way to control your computer by typing commands
- Also called: Terminal, Command Prompt, Shell

**CSS (Cascading Style Sheets)**
- Code that controls how a website looks
- Controls: colors, fonts, spacing, layout

**Deployment**
- The process of putting your code on the internet
- Makes your chatbot available to everyone

**GitHub**
- A website where people store and share code
- Like Google Drive, but for code

**HTML (HyperText Markup Language)**
- Code that creates the structure of a website
- Defines: headings, paragraphs, buttons, links

**JavaScript**
- A programming language that makes websites interactive
- The chatbot is written in JavaScript

**JSON (JavaScript Object Notation)**
- A way to store and organize data
- Uses brackets, quotes, and commas
- Example: `{"name": "HLPFL Records"}`

**Local**
- On your computer (not on the internet)
- Example: "Running locally" means running on your computer

**Node.js**
- Software that lets your computer run JavaScript code
- Required to run the chatbot

**Production**
- The live version that everyone can use
- Opposite of "development" or "testing"

**Repository (Repo)**
- A folder that contains all the code for a project
- Stored on GitHub

**Terminal**
- A program where you type commands
- Also called: Command Prompt (Windows), Terminal (Mac/Linux)

**Token**
- A secret code that proves your identity
- Like a password, but for programs

**Wrangler**
- A tool made by Cloudflare
- Helps you deploy code to Cloudflare Workers

---

## Getting Help

### If You're Stuck

**Option 1: Check the Troubleshooting Section**
- Look for your specific problem
- Follow the solution steps exactly

**Option 2: Search Online**
- Copy the error message
- Search on Google
- Add "Cloudflare Workers" to your search

**Option 3: Ask for Help**
- Email: contact@hlpflrecords.com
- Include:
  - What you were trying to do
  - What error message you saw
  - What steps you already tried

### Tips for Success

1. **Read each step carefully**
   - Don't skip steps
   - Don't rush

2. **Take breaks**
   - If you're frustrated, take a 10-minute break
   - Come back with fresh eyes

3. **Write things down**
   - Keep notes of what you did
   - Save important information (like API tokens)

4. **Ask questions**
   - There are no stupid questions
   - It's okay to not understand something

5. **Practice patience**
   - Learning new things takes time
   - It's okay to make mistakes

---

## Congratulations!

If you've made it this far, you have successfully:
- ✅ Set up the HLPFL chatbot
- ✅ Customized it for your needs
- ✅ Deployed it to the internet
- ✅ Learned valuable technical skills

**You did it!** 🎉

---

## Next Steps

Now that your chatbot is running, you can:

1. **Monitor Performance**
   - Check how many people use it
   - See what questions they ask
   - Improve answers based on feedback

2. **Add More Content**
   - Add more questions and answers
   - Update company information
   - Add new features

3. **Share It**
   - Tell people about your chatbot
   - Add it to your website
   - Promote it on social media

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Questions?** contact@hlpflrecords.com