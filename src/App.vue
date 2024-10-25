<template>
  <input v-for="item in msgList" v-my="test" :key="item.id" v-model="item.value" />
  <router-view></router-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const msgList = ref([
  {
    id: 1,
    value: ''
  },
  {
    id: 2,
    value: ''
  },
  {
    id: 3,
    value: ''
  }
])
</script>
