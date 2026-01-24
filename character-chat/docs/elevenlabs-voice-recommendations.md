# ElevenLabs Voice Recommendations for Archetypes

## How to Use
1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Search for the recommended voice names
3. Copy the Voice ID from the voice page
4. Add to your database or Pocket TTS configuration

---

## Female Archetypes

### Yandere / Obsessive Girlfriend
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Rachel | 21m00Tcm4TlvDq8ikWAM | Sweet but can go intense |
| Bella | EXAVITQu4vr4xnSDxMaL | Youthful, emotional range |
| Charlotte | XB0fDUnXU5powFXDhCwa | Soft with underlying intensity |

### Tsundere / Cold Exterior
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Elli | MF3mGyEYCl7XYWbV9V6O | Sharp, can sound annoyed |
| Grace | oWAxZDx7w5VEj9dCyTzz | Cool, composed |
| Emily | LcfcDJNUP1GQjkzn1xUU | Balanced cold/warm |

### Kuudere / Emotionless
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Freya | jsCqWAovK2LkecY7zXl4 | Calm, measured |
| Nicole | piTKgcLEGmPE4e6mEKli | Neutral, clinical |
| Glinda | z9fAnlkpzviPz146aGWa | Soft but detached |

### Princess / Royal
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Dorothy | ThT5KcBeYPX3keUQqHPh | Elegant, refined |
| Serena | pMsXgVXv3BLzUgSXRplE | Regal, commanding |

### Witch / Mysterious
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Jessie | t0jbNlBVZ17f02VDIeMI | Raspy, mystical |
| Lily | pFZP5JQG7iQjIQuC4Bku | Ethereal quality |

---

## Male Archetypes

### Vampire Prince / Cold CEO
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Adam | pNInz6obpgDQGcFmaJgB | Deep, smooth, authoritative |
| Antoni | ErXwobaYiN019PkySvjV | Suave, mysterious |
| Daniel | onwK4e9ZLuTAKqWW03F9 | Professional, cold |

### Mafia Boss / Dominant
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Josh | TxGEqnHWrfWFTfGW9XjX | Deep, commanding |
| Arnold | VR6AewLTigWG4xSOukaG | Gravelly, intimidating |
| Clyde | 2EiwWnXFnvU5JabPnv8n | Low, menacing |

### Yandere Boyfriend
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Marcus | 62xXoiJqEgxXIqT0LCOP | Intense, emotional |
| Patrick | ODq5zmih8GrVes37Dizd | Can flip sweet to dark |

### Knight / Protector
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Liam | TX3LPaxmHKxFdv7VOQHJ | Noble, steadfast |
| Ethan | g5CIjZEefAph4nQFvHAz | Warm, protective |

### Demon / Dark Fantasy
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Giovanni | zcAOhNBS3c14rBihAFp1 | Sinister charm |
| James | ZQe5CZNOzWyzPSCn5a3c | Deep, ominous |

---

## VTuber-Style Voices

### Energetic Female (Gura-type)
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Sarah | EXAVITQu4vr4xnSDxMaL | Bubbly, expressive |
| Matilda | XrExE9yKIg1WjnnlVkGX | Playful, youthful |

### Calm Female (Ina-type)
| Voice Name | Voice ID | Why It Works |
|------------|----------|--------------|
| Freya | jsCqWAovK2LkecY7zXl4 | Soothing, gentle |
| Serena | pMsXgVXv3BLzUgSXRplE | Calm, composed |

---

## How to Add a Voice

### Option 1: ElevenLabs Direct (requires API key)
```bash
# Add to .env
ELEVENLABS_API_KEY=your_key_here

# Run script
npx tsx scripts/download-elevenlabs-voices.ts
```

### Option 2: Clone to Pocket TTS
1. Generate sample audio using ElevenLabs
2. Upload to your Pocket TTS server
3. Map archetype to new voice ID

---

## Priority Order for New Voices

1. **Yandere Girlfriend** - Rachel (21m00Tcm4TlvDq8ikWAM) ⭐
2. **Mafia Boss** - Josh (TxGEqnHWrfWFTfGW9XjX) ⭐
3. **Vampire Prince** - Adam (pNInz6obpgDQGcFmaJgB) ⭐
4. **Tsundere** - Elli (MF3mGyEYCl7XYWbV9V6O)
5. **Princess** - Dorothy (ThT5KcBeYPX3keUQqHPh)
6. **Kuudere** - Freya (jsCqWAovK2LkecY7zXl4)

⭐ = High demand archetypes based on search volume
