/**
 * useDesign hook
 * 用于生成组件的CSS类名前缀
 */
export function useDesign() {
  const getPrefixCls = (componentName: string): string => {
    return `v-${componentName}`
  }

  return {
    getPrefixCls
  }
}