# Türkçe Proje Özeti

**Vanguard Host Trust: Integrity, Privilege, and Digital Trust**, Riot Vanguard'ın kamuya açık host-trust modelini sistem güvenliği açısından inceleyen, kanıt sınırları açıkça belirlenmiş bir araştırma projesidir.

Projenin ana sorusu şudur:

> Riot Vanguard, host seviyesinde oyun bütünlüğünü nasıl sağlamaya çalışır ve ayrıcalıklı denetim ile daha güçlü platform gereksinimleri hangi güvenlik ve erişilebilirlik ödünleşimlerini doğurur?

Çalışma dört kanıt sınıfını birbirinden ayırır: Riot'ın kendi açıklamaları, Microsoft'un belgelediği Windows mekanizmaları, bu kaynaklardan türetilen koşullu proje yorumları ve repodaki demonstrator tarafından yeniden üretilebilen sonuçlar. Böylece bir üretici açıklaması bağımsız doğrulama gibi, bir platform özelliği de kusursuz güvenlik garantisi gibi sunulmaz.

Kamuya açık modele göre kullanıcı modundaki `vgc` servisi, çekirdek modundaki `vgk` sürücüsü ve uzak politika katmanı farklı güven sınırlarında yer alır. Kernel yetkisi, daha düşük ayrıcalıktaki tehditlere karşı görünürlük ve direnç sağlayabilir; ancak hata, uyumsuzluk veya güncelleme kaynaklı sorunların etkisini de büyütür. Bu yüzden kernel yetkisi tek başına yazılımı ne güvenilir ne de kötü niyetli olarak sınıflandırmaya yeter.

Rapor, önceki system-start yaklaşımı ile 2026'da açıklanan isteğe bağlı On-Demand modelini karşılaştırır. System-start modeli erken başlama ve kesintisiz gözlem sürekliliğine dayanır. On-Demand modeli ise uygun bilgisayarlarda Secure Boot, TPM 2.0, VBS/HVCI, IOMMU ve imzalı runtime attestation gibi platform mekanizmalarına daha fazla güven yerleştirir. Projenin temel yorumu şudur: On-Demand güven ihtiyacını ortadan kaldırmaz; güvenin bir bölümünü sürekli Vanguard gözleminden sertleştirilmiş platform durumuna, imzalı kanıta ve backend yorumuna taşır.

Altı ana bulgu elde edilmiştir:

1. Kernel ayrıcalığı hem güvenlik kontrolü hem de yüksek sorumluluk kaynağıdır.
2. Bütünlük, özgünlük, ayrıcalık ve politika kabulü farklı sorulardır.
3. On-Demand, geçmiş sistem durumuna güvenin nereden elde edildiğini değiştirir.
4. Windows güvenlik mekanizmaları birbirini tamamlar fakat her biri koşulludur.
5. Gizlilik, yalnızca kernel yetkisinden veya aktif çalışma süresinden çıkarılamaz.
6. Daha güçlü güvenlik koşulları, meşru kullanıcıların erişimini ve uyumluluğu etkileyebilir.

Repo içindeki **Interactive Security Demonstrator**, projenin ana ürünü değil, araştırmayı destekleyen deney katmanıdır. Sistem modelini gösterir, beş public gereksinim grubunu manuel olarak bir araya getirir ve SHA-256 ile iki dosyanın byte düzeyinde aynı olup olmadığını karşılaştırır. Uygulama cihazı, Windows'u veya Vanguard'ı incelemez; gerçek Pre-Check sonucu üretmez; backend'e veri göndermez. Hash eşleşmesi de dosyanın güvenli, özgün veya yetkili olduğunu kanıtlamaz.

Çalışma bir ürün denetimi değildir. Canlı Windows/Vanguard ölçümü, reverse engineering, trafik yakalama, bellek analizi, bypass veya exploit geliştirme, performans testi, cihaz sertifikasyonu ve kişisel veri kullanımı kapsam dışıdır. Sonuçlar yalnızca 12 Temmuz 2026 tarihli 15 resmi public kaynak, 18 kayıtlı claim ve repoda test edilen demonstrator davranışıyla sınırlıdır.

