<template>
    <div
        v-for="(conversation, index) in conversations"
        :key="index"
        class="mt-4 flex cursor-pointer items-center justify-between rounded-full border-2 border-white bg-transparent px-4 py-2 text-white transition duration-300 hover:bg-white hover:text-black"
        @click="handleTitleClick(conversation)"
    >
        <!-- list the titles from the database -->
        {{ conversation.title }}

        <div class="flex items-center">
            <!-- icon to allow the conversation to be deleted by clicking and calling deleteConversation(ID) -->
            <UButton
                icon="i-heroicons-trash-16-solid"
                class="mr-2 p-2 hover:text-chatbot-red"
                size="2xs"
                color="black"
                square
                variant="ghost"
                title="Click to delete the conversation"
                @click.stop="deleteConversation(conversation.id)"
            />
            <!-- icon to copy the link to share the conversation -->
            <UButton
                icon="i-heroicons-share-16-solid"
                class="p-2 hover:text-chatbot-red"
                size="2xs"
                color="black"
                square
                variant="ghost"
                title="Click to share the conversation"
                @click.stop="shareConversation(conversation.id)"
            />

            <UModal v-model="showLinkPopup" :overlay="false">
                <!-- header section of popup -->
                <UCard class="text-chatbot-black dark:text-chatbot-white">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-chatbot-white">
                                Share a Link to this Conversation
                            </h3>
                            <UButton
                                color="gray"
                                variant="ghost"
                                icon="i-heroicons-x-mark-20-solid"
                                class="-my-1"
                                @click="showLinkPopup = false"
                            />
                        </div>
                    </template>

                    <div class="flex items-center justify-between text-chatbot-black dark:text-chatbot-white">
                        <!-- regular part of text for popup -->
                        <p>Link: {{ copiedUrl }}</p>
                        <!-- conversation is only set to public when clicking the UButton below -->
                        <UButton
                            icon="i-heroicons-clipboard-document-16-solid"
                            class="font-semibold hover:text-chatbot-red"
                            size="2xs"
                            color="black"
                            square
                            variant="ghost"
                            title="Click to Copy Link"
                            @click="copiedConversationLink()"
                        >
                            Copy and Share Link
                        </UButton>
                    </div>
                </UCard>
            </UModal>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const { token } = useAuth();
const router = useRouter();
// whether to show link to copy conversation
const showLinkPopup = ref(false);
// url and id of copied conversation to share
const copiedUrl = ref("");
const copiedId = ref("");

// emit to call parent function
const emit = defineEmits(["conversation-selected"]);

const toast = useToast();

// returns conversations to update the left panel of titles to click
const getConversations = async () => {
    try {
        // sets 'conversations' to values from get request
        const { data } = await useFetch(`${config.public.apiURL}/conversations`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token.value,
            },
            // reverse the order of titles to show recent conversations at the top
            transform: resp => resp.reverse(),
        });
        return data;
    } catch (error) {
        console.error("Error fetching conversations: ", error);
    }
};

const refreshConversations = async () => {
    conversations.value = (await getConversations()).value;
};

// deletes the conversation in the database
const deleteConversation = async inputConversationId => {
    // popup window to confirm the user's choice
    if (window.confirm("Are you sure you want to delete this conversation?")) {
        const isConversationDeleted = await $fetch(`${config.public.apiURL}/conversations/${inputConversationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: token.value,
            },
        });
        if (isConversationDeleted) {
            // Remove the deleted conversation from the conversations array
            conversations.value = conversations.value.filter(conversation => conversation.id !== inputConversationId);
        }
    }
};

defineExpose({
    refreshConversations,
    deleteConversation,
});

const conversations = await getConversations();

// when clicking a title, sets the conversation ID to the correct one for the conversation
const handleTitleClick = conversation => {
    router.push({ path: `/chat/${conversation.id}` });
    emit("conversation-selected", conversation.id);
};

// gets a link to share the conversation
const shareConversation = conversationId => {
    // sets url and id for unique conversation id
    copiedId.value = conversationId;
    copiedUrl.value = `${window.location.origin}/chat/${conversationId}`;
    showLinkPopup.value = true;
};

const copiedConversationLink = async () => {
    // change privacy of conversation from private to public
    try {
        await $fetch(`${config.public.apiURL}/conversations/${copiedId.value}/set_public`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token.value,
            },
        });

        // copy to clipboard
        // from https://www.w3schools.com/howto/howto_js_copy_clipboard.asp 09-04-24
        await navigator.clipboard.writeText(copiedUrl.value);

        // small popup to say link copied
        toast.add({
            id: "successful_copy",
            description: "Link Copied and Conversation Set to Public",
        });
    } catch (error) {
        console.error("Error when sharing conversation: ", error);
    }
};
</script>

<style scoped></style>
