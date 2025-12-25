#!/bin/bash
# Monitor script to check audit progress and notify when complete

cd "$(dirname "$0")/.."

echo "Monitoring voice audit progress..."
echo "Press Ctrl+C to stop monitoring"

while true; do
    if [ -f scripts/audit-results.json ]; then
        echo ""
        echo "=== AUDIT COMPLETE ==="
        echo "Results file found!"
        echo ""
        echo "Top 10 characters:"
        jq -r '.[:10] | .[] | "\(.rank). \(.characterName) -> \(.bestVoice) (Score: \(.bestScore))"' scripts/audit-results.json 2>/dev/null || echo "Could not parse results"
        echo ""
        if [ -f docs/voice-audit-report.md ]; then
            echo "Full report: docs/voice-audit-report.md"
        fi
        break
    fi
    
    if [ -f scripts/tts-samples.json ]; then
        tts_count=$(jq 'length' scripts/tts-samples.json 2>/dev/null || echo "0")
        echo "TTS samples: $tts_count/900"
    fi
    
    if [ -f scripts/voice-evaluations.json ]; then
        eval_count=$(jq 'length' scripts/voice-evaluations.json 2>/dev/null || echo "0")
        echo "Evaluations: $eval_count/900"
    fi
    
    sleep 30
done



