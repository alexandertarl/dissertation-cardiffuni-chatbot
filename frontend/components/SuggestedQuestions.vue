<template>
    <!-- outputs suggested questions when the array is filled -->
    <div v-if="questionArray.length > 0" class="my-1.5 w-fit bg-slate-300 p-2">
        <!-- class used for styling, using tailwind's pink used to match the UI of the chatbot's conversation-->
        <p class="mb-2 max-w-96 text-wrap break-words rounded p-1 text-left text-zinc-900">
            Ask a follow up question...
        </p>
        <!-- hovering the button makes the background colour slightly darker, and changes cursor to pointer -->
        <!-- each button is each question of the array of 3 questions -->
        <div v-for="question in questionArray" :key="question">
            <button
                type="submit"
                class="mb-2 max-w-96 cursor-pointer text-wrap break-words rounded border-2 border-slate-600 bg-slate-400 p-1 text-left text-zinc-900 shadow-lg hover:bg-slate-500"
                @click="$emit('askToChatBot', question)"
            >
                <!-- two functions called so question is asked to chatbot (using emit to call function from parent)
                then questionArray is emptied so removes this div from being displayed while assistant message is generated -->
                {{ question }}
            </button>
        </div>
    </div>
</template>

<script setup>
// suggested questions to ask
const questionArray = ref([]);
const config = useRuntimeConfig();

// prop to take array of questions form parent [[id]].vue
const props = defineProps({
    chatMessages: {
        type: Array,
        default: () => [],
    },
});

// emit to call function 'submitQuestion' from parent [[id]].vue
defineEmits(["askToChatBot"]);

const fetchSuggestedQuestions = async () => {
    // post request to /suggested
    // sends chat messages in post request
    // returns json array (jsonSent) of 3 questions in key 'questions'
    const jsonSent = await $fetch(`${config.public.apiURL}/suggested`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            chat_messages: props.chatMessages,
        },
    });

    // exception handling for if valid response from post request
    try {
        // gets array of questions from key 'questions'
        questionArray.value = jsonSent.questions;
    } catch {
        // cannot get array of suggested questions from key 'questions'
        console.log("error getting json array of suggested questions");
    }
};

// empties suggested questions at the start of response generation
// so doesn't clutter screen when generating a response
const clear = () => {
    questionArray.value = [];
};

// define expose so getSuggestedQs is called when 'suggestedQ.value.getSuggestedQs();' is written in [[id]].vue
defineExpose({
    fetchSuggestedQuestions,
    clear,
});
</script>
