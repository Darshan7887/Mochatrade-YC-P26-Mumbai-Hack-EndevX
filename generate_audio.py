# -*- coding: utf-8 -*-
"""
BrainBerry - Phonics Audio Generator
Uses gTTS (Google Text-to-Speech) to create real human-voice MP3 files.
Run:  python generate_audio.py
Output: audio/a.mp3 ... audio/j.mp3
"""

import sys
import os

# Force UTF-8 output on Windows to avoid cp1252 errors
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from gtts import gTTS

# Folder where MP3s will be saved
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")
os.makedirs(OUT_DIR, exist_ok=True)

# Letter -> phonics sound (slow, child-friendly pronunciation)
phonics = {
    "a": "aah",
    "b": "buh",
    "c": "kuh",
    "d": "duh",
    "e": "eh",
    "f": "fuh",
    "g": "guh",
    "h": "huh",
    "i": "ih",
    "j": "juh",
}

print("Generating phonics audio files...")
for letter, sound in phonics.items():
    out_path = os.path.join(OUT_DIR, f"{letter}.mp3")
    if os.path.exists(out_path):
        print(f"  [SKIP] {letter}.mp3 already exists")
        continue
    # slow=True - slower, clearer voice, perfect for kids
    tts = gTTS(text=sound, lang="en", slow=True)
    tts.save(out_path)
    size = os.path.getsize(out_path)
    print(f"  [DONE] {letter}.mp3  sound=({sound})  size={size} bytes")

print("")
print("[SUCCESS] All phonics audio files created in /audio/")
