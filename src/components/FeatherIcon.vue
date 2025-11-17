<template>
  <span v-html="svgContent" :style="iconStyle"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import feather from 'feather-icons'

interface Props {
  name: string
  size?: string | number
  color?: string
  strokeWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2
})

const svgContent = computed(() => {
  const icon = feather.icons[props.name]
  if (!icon) {
    console.warn(`Icon "${props.name}" not found`)
    return ''
  }
  
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
  const strokeWidthValue = typeof props.strokeWidth === 'number' 
    ? props.strokeWidth.toString() 
    : props.strokeWidth
  
  return icon.toSvg({
    width: sizeValue,
    height: sizeValue,
    color: props.color,
    'stroke-width': strokeWidthValue
  })
})

const iconStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size
}))
</script>

<style scoped>
:deep(svg) {
  display: block;
}
</style>

