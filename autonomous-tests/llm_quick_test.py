"""
🤖 LLM Hızlı Test - Tek Sayfa Facebook Kontrolü
"""

from autonomous_tester import (
    AutonomousTester,
    GroqAgent,
    SITE_URL
)

def quick_llm_test():
    """Tek sayfada LLM ile Facebook testi"""
    
    print("\n" + "="*60)
    print("🤖 LLM OTONOM TEST - FACEBOOK KONTROLÜ")
    print("="*60 + "\n")
    
    tester = AutonomousTester(headless=False)
    
    # Tek sayfa, 3 basit hedef
    goals = [
        "Sayfadaki tüm giriş/kayıt butonlarını tespit et",
        "Facebook ile giriş veya kayıt butonu var mı kontrol et (OLMAMALI!)",
        "Google ile giriş veya kayıt butonu var mı kontrol et (OLMALI)"
    ]
    
    result = tester.run_autonomous_test(
        url=f"{SITE_URL}/uzmanlar.html",
        goals=goals
    )
    
    return result

if __name__ == "__main__":
    quick_llm_test()
