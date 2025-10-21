<template>
  <div class="app-container home">
    <!-- Tailwind CSS 测试区域 -->
    <div class="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-white mb-4">🎉 Tailwind CSS 配置成功！</h1>
      <p class="text-blue-100 text-lg">
        恭喜！Tailwind CSS 已成功集成到若依管理系统中。
      </p>
    </div>

    <!-- 功能演示卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- 主色调卡片 -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-primary-600">主色调测试</h3>
        </div>
        <div class="card-body">
          <div class="space-y-2">
            <div class="w-full h-4 bg-primary-500 rounded"></div>
            <div class="w-full h-4 bg-primary-400 rounded"></div>
            <div class="w-full h-4 bg-primary-300 rounded"></div>
          </div>
          <p class="text-sm text-gray-600 mt-3">与 Element Plus 主题色保持一致</p>
        </div>
      </div>

      <!-- 功能色卡片 -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-success-600">功能色测试</h3>
        </div>
        <div class="card-body">
          <div class="flex space-x-2 mb-3">
            <div class="w-8 h-8 bg-success-500 rounded-full"></div>
            <div class="w-8 h-8 bg-warning-500 rounded-full"></div>
            <div class="w-8 h-8 bg-danger-500 rounded-full"></div>
            <div class="w-8 h-8 bg-info-500 rounded-full"></div>
          </div>
          <p class="text-sm text-gray-600">成功、警告、危险、信息色</p>
        </div>
      </div>

      <!-- 组件样式卡片 -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-700">组件样式测试</h3>
        </div>
        <div class="card-body">
          <div class="space-y-3">
            <button class="btn btn-primary w-full">主要按钮</button>
            <button class="btn btn-success w-full">成功按钮</button>
            <button class="btn btn-warning w-full">警告按钮</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 响应式测试 -->
    <div class="card mb-8">
      <div class="card-header">
        <h3 class="text-xl font-semibold text-gray-800">响应式布局测试</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="bg-blue-100 p-4 rounded text-center">
            <div class="text-blue-600 font-semibold">手机端</div>
            <div class="text-sm text-blue-500">1列</div>
          </div>
          <div class="bg-green-100 p-4 rounded text-center">
            <div class="text-green-600 font-semibold">平板端</div>
            <div class="text-sm text-green-500">2列</div>
          </div>
          <div class="bg-yellow-100 p-4 rounded text-center">
            <div class="text-yellow-600 font-semibold">桌面端</div>
            <div class="text-sm text-yellow-500">3列</div>
          </div>
          <div class="bg-purple-100 p-4 rounded text-center">
            <div class="text-purple-600 font-semibold">大屏幕</div>
            <div class="text-sm text-purple-500">4列</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 暗色模式测试 -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-xl font-semibold text-gray-800">暗色模式支持</h3>
      </div>
      <div class="card-body">
        <p class="text-gray-600 mb-4">
          Tailwind CSS 已配置暗色模式支持，可以与 Element Plus 的暗色主题无缝集成。
        </p>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span class="text-sm text-gray-600 dark:text-gray-300">自适应背景</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded"></div>
            <span class="text-sm text-gray-600 dark:text-gray-300">自适应文本</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Index">
const version = ref('3.9.0')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {

}
</style>

