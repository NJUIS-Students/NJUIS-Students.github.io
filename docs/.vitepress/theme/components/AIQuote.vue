<template>
  <div v-if="quote" class="ai-quote-bar" :key="quote.text">
    <span class="ai-quote-text">
      <span v-for="(ch, ci) in quoteChars" :key="ci" class="ai-quote-char" :style="{ animationDelay: ci * 25 + 'ms' }">{{ ch }}</span>
    </span>
    <span class="ai-quote-author">— {{ quote.author }}</span>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vitepress'

const quotes = [
  { text: 'The question of whether a computer can think is no more interesting than whether a submarine can swim.', author: 'Edsger Dijkstra' },
  { text: 'A year spent in artificial intelligence is enough to make one believe in God.', author: 'Alan Perlis' },
  { text: 'Machine intelligence is the last invention that humanity will ever need to make.', author: 'Nick Bostrom' },
  { text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.', author: 'Alan Turing' },
  { text: 'The key to artificial intelligence has always been the representation.', author: 'Jeff Hawkins' },
  { text: 'By far, the greatest danger of Artificial Intelligence is that people conclude too early that they understand it.', author: 'Eliezer Yudkowsky' },
  { text: 'I visualize a time when we will be to robots what dogs are to humans.', author: 'Claude Shannon' },
  { text: 'The pace of progress in artificial intelligence is incredibly fast.', author: 'Elon Musk' },
  { text: 'Artificial intelligence would be the ultimate version of Google.', author: 'Larry Page' },
  { text: 'People worry that computers will get too smart and take over the world, but the real problem is that they are too stupid and they have already taken over the world.', author: 'Pedro Domingos' },
  { text: 'Deep learning is going to be able to do everything.', author: 'Geoffrey Hinton' },
  { text: 'What we want is a machine that can learn from experience.', author: 'Alan Turing' },
  { text: 'The development of full artificial intelligence could spell the end of the human race... It would take off on its own, and re-design itself at an ever increasing rate.', author: 'Stephen Hawking' },
  { text: 'Nobody phrases it this way, but I think that artificial intelligence is almost a humanities discipline.', author: 'Sebastian Thrun' },
  { text: 'AI is likely to be either the best or worst thing to happen to humanity.', author: 'Stephen Hawking' },
  { text: 'The coming era of Artificial Intelligence will not be the era of war, but be the era of deep compassion, non-violence, and love.', author: 'Amit Ray' },
  { text: 'Success in creating AI would be the biggest event in human history. Unfortunately, it might also be the last.', author: 'Stephen Hawking' },
  { text: 'Anything that could give rise to smarter-than-human intelligence — in the form of Artificial Intelligence — seems to me to be something that could either save us or destroy us.', author: 'Sam Harris' },
  { text: 'Intelligence is the ability to adapt to change.', author: 'Stephen Hawking' },
  { text: 'The real question is, when will we draft an artificial intelligence bill of rights?', author: 'Gray Scott' },
  { text: 'I think the brain is essentially a computer and consciousness is like a computer program.', author: 'Stephen Hawking' },
  { text: 'Attention is all you need.', author: 'Vaswani et al.' },
  { text: 'Generative models are the most interesting and promising area of machine learning.', author: 'Yann LeCun' },
  { text: 'One of the biggest challenges in AI is building machines that can understand the world the way humans do.', author: 'Yann LeCun' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
]

const route = useRoute()
const quote = ref(null)

const quoteChars = computed(() => {
  if (!quote.value) return []
  return ('"' + quote.value.text + '"').split('')
})

function pickQuote() {
  quote.value = null
  requestAnimationFrame(() => {
    quote.value = quotes[Math.floor(Math.random() * quotes.length)]
  })
}

pickQuote()
watch(() => route.path, pickQuote)
</script>

<style scoped>
.ai-quote-bar {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(90deg, rgba(0,229,255,0.04), rgba(124,77,255,0.06), rgba(0,229,255,0.04));
  border-bottom: 1px solid rgba(0,229,255,0.08);
  font-size: 0.78rem;
  line-height: 1.5;
  flex-wrap: wrap;
}

.ai-quote-text {
  color: var(--vp-c-text-2);
  font-style: italic;
  letter-spacing: 0.01em;
}

.ai-quote-char {
  display: inline-block;
  opacity: 0;
  animation: char-appear 0.3s ease-out forwards;
}

@keyframes char-appear {
  0% { opacity: 0; transform: translateY(6px); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

.ai-quote-author {
  color: var(--ai-cyan, #00e5ff);
  font-weight: 600;
  font-size: 0.72rem;
  opacity: 0;
  white-space: nowrap;
  animation: author-in 0.5s ease-out forwards;
  animation-delay: 1.8s;
}

@keyframes author-in {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 0.7; transform: translateX(0); }
}
</style>
