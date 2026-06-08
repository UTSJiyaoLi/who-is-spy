<template>
  <div class="qrcode-wrapper">
    <canvas ref="canvasRef" class="qrcode-canvas"></canvas>
    <p class="qrcode-hint">扫码加入房间</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  text: { type: String, required: true }
})

const canvasRef = ref(null)

async function generate() {
  if (!canvasRef.value || !props.text) return
  try {
    await QRCode.toCanvas(canvasRef.value, props.text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#1a1a2e'
      }
    })
  } catch (err) {
    console.error('QRCode generation failed:', err)
  }
}

onMounted(generate)
watch(() => props.text, generate)
</script>

<style scoped>
.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qrcode-canvas {
  border-radius: 12px;
}

.qrcode-hint {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
