<template>
  <transition name="fade" @after-leave="close">
    <div class="cst-result-toast" v-if="localResult.show">
      <a href="javascript:;" class="close" @click="hide">&times;</a>
      <result :result="localResult" theme="dark"></result>
    </div>
  </transition>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue';
import { clearSelection } from '../helpers/selection';
import Result from './Result.vue';

export default {
  props: ['result'],
  setup(props, { emit }) {
    const localResult = ref({ ...props.result });
    const timer = ref(null);

    const translate = () => {
      const message = {
        type: 'translate',
        text: localResult.value.text,
        from: 'page'
      };
      chrome.runtime.sendMessage(message, (result) => {
        Object.assign(localResult.value, result);

        // Set auto-close timer if timeout is provided
        if (result.timeout) {
          timer.value = setTimeout(() => {
            localResult.value.show = false;
          }, result.timeout * 1000);
        }
      });
    };

    const hide = () => {
      clearSelection();
      localResult.value.show = false;
      if (timer.value) {
        clearTimeout(timer.value);
      }
    };

    const close = () => {
      emit('close');
    };

    // Start translation when component is created
    translate();

    // Cleanup timer on unmount
    onBeforeUnmount(() => {
      if (timer.value) {
        clearTimeout(timer.value);
      }
    });

    return {
      localResult,
      hide,
      close
    };
  },
  components: {
    Result
  },
};
</script>

