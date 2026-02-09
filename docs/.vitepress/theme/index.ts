import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'
import OSCourseCard from './components/OSCourseCard.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('OSCourseCard', OSCourseCard)
  }
}
