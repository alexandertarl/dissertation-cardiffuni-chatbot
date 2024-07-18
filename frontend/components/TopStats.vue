<template>
    <div class="relative mr-8 flex h-32 w-72 flex-col rounded border border-gray-300 bg-chatbot-white p-12">
        <div class="absolute left-2 top-2 flex flex-col uppercase">
            <span class="font-sans font-bold">{{ statTitle }}</span>
            <span>{{ statTimerange }}</span>
            <span class="font-sans font-bold">{{ statValue }}</span>
        </div>
    </div>
</template>

<script setup>
// Define props directly in the script setup block
defineProps({
    statTitle: {
        type: String,
        required: true,
    },
    statTimerange: {
        type: String,
        required: true,
    },
    statValue: {
        type: String,
        required: true,
    },
});
</script>
