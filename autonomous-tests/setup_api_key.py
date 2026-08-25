"""
🔑 Gemini API Key Setup Script
Otomatik olarak API key alıp .env dosyasına ekler
"""

import webbrowser
import time
import os
from pathlib import Path

print("=" * 60)
print(" 🔑 GEMİNİ API KEY KURULUMU".center(60))
print("=" * 60)
print()

print("📋 Adımlar:")
print("  1. Google AI Studio'ya gideceğiz")
print("  2. 'Get API Key' butonuna tıklayın")
print("  3. API key'i kopyalayın")
print("  4. Buraya yapıştırın")
print()

input("Hazır mısınız? Enter'a basın...")

# Google AI Studio'yu aç
print("\n🌐 Google AI Studio açılıyor...")
webbrowser.open('https://aistudio.google.com/apikey')
print("✅ Tarayıcınızda açıldı!")

print("\n" + "=" * 60)
print(" ⚠️  ÖNEMLİ TALİMATLAR".center(60))
print("=" * 60)
print()
print("Tarayıcıda:")
print("  1. Google hesabınızla giriş yapın")
print("  2. 'Create API Key' veya 'Get API Key' butonuna tıklayın")
print("  3. API key'i kopyalayın (Ctrl+C)")
print("  4. Buraya geri dönün ve yapıştırın")
print()

# API key al
api_key = input("🔑 API Key'inizi buraya yapıştırın: ").strip()

if not api_key:
    print("\n❌ API key boş olamaz!")
    exit(1)

if not api_key.startswith('AIza'):
    print("\n⚠️  Uyarı: Gemini API key'leri genellikle 'AIza' ile başlar.")
    print(f"   Girdiğiniz: {api_key[:10]}...")
    devam = input("   Yine de devam edilsin mi? (e/h): ")
    if devam.lower() != 'e':
        exit(1)

# .env dosyasını güncelle
env_file = Path('.env')

# Mevcut .env'yi oku
if env_file.exists():
    with open(env_file, 'r', encoding='utf-8') as f:
        env_content = f.read()
else:
    env_content = ''

# GOOGLE_API_KEY ekle veya güncelle
if 'GOOGLE_API_KEY=' in env_content:
    # Güncelle
    lines = env_content.split('\n')
    new_lines = []
    for line in lines:
        if line.startswith('GOOGLE_API_KEY='):
            new_lines.append(f'GOOGLE_API_KEY={api_key}')
        else:
            new_lines.append(line)
    env_content = '\n'.join(new_lines)
else:
    # Ekle
    if env_content and not env_content.endswith('\n'):
        env_content += '\n'
    env_content += f'GOOGLE_API_KEY={api_key}\n'

# .env'ye kaydet
with open(env_file, 'w', encoding='utf-8') as f:
    f.write(env_content)

print("\n✅ API key .env dosyasına kaydedildi!")
print()

# Test et
print("🧪 API key test ediliyor...")
try:
    import google.generativeai as genai
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    response = model.generate_content("Merhaba! Sadece 'OK' diye cevap ver.")
    
    print("✅ API key çalışıyor!")
    print(f"📝 Gemini'den yanıt: {response.text[:50]}")
    print()
    
except Exception as e:
    print(f"⚠️  API key test edilemedi: {str(e)}")
    print("   Ama .env dosyasına kaydedildi, testlerde deneyeceğiz.")
    print()

print("=" * 60)
print(" ✨ KURULUM TAMAMLANDI!".center(60))
print("=" * 60)
print()
print("Şimdi testleri çalıştırabilirsiniz:")
print()
print("  python hybrid_tester.py")
print()
