# RunPod Serverless Migration Guide

This guide explains how to migrate your RunPod setup from **Pod-based** infrastructure to **Serverless** (auto-scaling) infrastructure for optimal cost management and performance.

## Why Serverless?

**Serverless** infrastructure automatically scales based on demand:
- **Auto-scaling**: Spins up workers when requests come in, shuts down when idle
- **Pay-per-use**: Only pay for actual compute time (per second), not idle time
- **No manual management**: No need to manually stop/start pods
- **Zero idle costs**: When not processing requests, you pay nothing
- **Instant scaling**: Handles traffic spikes automatically

**Pod-based** infrastructure requires manual management:
- Runs continuously even when idle (costly)
- Requires manual stop/start to manage costs
- Fixed capacity (no auto-scaling)
- Better for: continuous workloads, development, or when you need persistent state

## When to Use Serverless

Choose **Serverless** for:
- **Inference workloads** (TTS, image generation, LLM inference)
- **Variable traffic** patterns
- **Cost optimization** (production deployments)
- **APIs** with intermittent usage

Choose **Pods** for:
- **Training** workloads
- **Continuous processing** (24/7 tasks)
- **Development** and testing
- **Jupyter notebooks** or interactive work

## Migration Steps

### Step 1: Prepare Your Endpoint

1. Navigate to **RunPod Console** → **Serverless**
2. Click **+ New Endpoint**
3. Choose your configuration:
   - **Name**: `agentwood-tts-serverless` (or your service name)
   - **GPU Type**: Select based on your needs (e.g., RTX 4090, A40)
   - **Template**: Choose from RunPod templates or create custom

### Step 2: Deploy Your Docker Image

**Option A: Use Existing RunPod Template**
- Browse templates and select one that matches your workload
- Common templates: `runpod/pytorch`, `runpod/tensorflow`, custom TTS images

**Option B: Deploy Custom Docker Image**
1. Ensure your Docker image includes a **RunPod Serverless Handler**
2. Your handler must implement:
   ```python
   import runpod
   
   def handler(event):
       # Your inference logic here
       # event["input"] contains the request payload
       return {"output": result}
   
   runpod.serverless.start({"handler": handler})
   ```
3. Push image to Docker Hub or RunPod Container Registry
4. Reference in endpoint configuration

### Step 3: Configure Auto-Scaling

Set your scaling parameters:
- **Min Workers**: `0` (cost optimization - no idle workers)
- **Max Workers**: `5-10` (depends on expected traffic)
- **GPU RAM**: Match your model requirements
- **Throttle Delay**: `15-30s` (time before worker shuts down after idle)
- **Execution Timeout**: `60-300s` (max request duration)

### Step 4: Update Application Code

Replace your Pod API endpoint with ServerlessEndpoint:

**Before (Pod-based):**
```typescript
const response = await fetch('https://[POD_ID]-8000.proxy.runpod.net/inference', {
  method: 'POST',
  body: JSON.stringify({ text: "Hello" })
});
```

**After (Serverless):**
```typescript
const response = await fetch('https://api.runpod.ai/v2/[ENDPOINT_ID]/runsync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RUNPOD_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    input: {
      text: "Hello"
    }
  })
});
```

### Step 5: Update Environment Variables

Update your `.env` file:
```bash
# Old Pod-based
# RUNPOD_POD_URL=https://[POD_ID]-8000.proxy.runpod.net

# New Serverless
RUNPOD_ENDPOINT_ID=your-endpoint-id-here
RUNPOD_API_KEY=your-runpod-api-key-here
```

### Step 6: Test the Endpoint

1. **Send a test request** via RunPod Console or your application
2. **Monitor Cold Starts**: First request may take 10-30s (worker initialization)
3. **Check Logs**: View execution logs in RunPod Console → Serverless → Logs
4. **Verify Auto-Scaling**: Send multiple concurrent requests to test scaling

### Step 7: Terminate Old Pod (Optional)

Once serverless is working:
1. Go to **RunPod Console** → **Pods**
2. Select your old pod
3. Click **Terminate** (this permanently deletes the pod)
4. **Note**: Only do this after confirming serverless works correctly

## Cost Comparison Example

**Scenario**: TTS API with 1000 requests/day, each taking 5 seconds

### Pod-Based (24/7 RTX 4090)
- **Cost**: $0.69/hour × 24 hours × 30 days = **$496.80/month**
- Runs continuously even when idle

### Serverless (RTX 4090)
- **Cost**: $0.00022/second (active time only)
- 1000 requests × 5 seconds × 30 days = 150,000 seconds
- 150,000 seconds × $0.00022 = **$33/month**

**Savings**: $463.80/month (93% reduction)

## Monitoring & Optimization

### Check Your Usage
- **Dashboard**: RunPod Console → Serverless → Analytics
- **Metrics**: Request count, latency, worker utilization
- **Costs**: Real-time spending tracker

### Optimization Tips
1. **Reduce cold starts**: Keep `Min Workers = 1` for critical APIs (costs ~$15/mo for idle)
2. **Optimize model loading**: Cache models in Docker image
3. **Batch requests**: Process multiple items per request
4. **Monitor throttle delay**: Adjust based on traffic patterns

## Troubleshooting

**Issue**: High cold start latency
- **Solution**: Increase `Min Workers` or optimize Docker image size

**Issue**: Requests timing out
- **Solution**: Increase `Execution Timeout` or optimize inference code

**Issue**: Workers not auto-scaling
- **Solution**: Check `Max Workers` setting and GPU availability

## Additional Resources

- [RunPod Serverless Docs](https://docs.runpod.io/serverless/overview)
- [Serverless Handler Examples](https://github.com/runpod/serverless-examples)
- [RunPod API Reference](https://docs.runpod.io/reference/overview)

---

**Need Help?** Contact RunPod Support or check their Discord community.
