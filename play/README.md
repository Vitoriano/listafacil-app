# Assets da marca e da loja

Gerados por `python3 play/generate.py` (Pillow). A sacola é redesenhada como vetor a partir das
medidas do `assets/icon.png` original, então tudo sai nítido em qualquer tamanho.

| Arquivo | Uso | Especificação |
|---|---|---|
| `icon-512.png` | Google Play Console → Ficha da loja → **Ícone do app** | 512×512, PNG, sem transparência |
| `feature-graphic-1024x500.png` | Google Play Console → **Gráfico de recursos** | 1024×500, PNG, sem transparência |
| `logo-1024.png` | Logo completa (sacola + nome) sobre o vermelho da marca | 1024×1024 |
| `logo-white-transparent-1024.png` | Logo branca em fundo transparente (site, materiais) | 1024×1024, PNG com alpha |
| `ios-icon-1024.png` | Candidato a `assets/icon.png` (App Store exige 1024 sem alpha) | 1024×1024 |
| `android-icon-foreground.png` | Copiado para `assets/` (ícone adaptativo) | 1024×1024, glifo na zona segura |
| `android-icon-background.png` | Copiado para `assets/` | 1024×1024, `#EA1D2C` |
| `android-icon-monochrome.png` | Copiado para `assets/` (ícone temático Android 13+) | 1024×1024 |

Cor da marca: `#EA1D2C` (a mesma de `adaptiveIcon.backgroundColor` e do splash).
