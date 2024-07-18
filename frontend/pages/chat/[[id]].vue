<template>

                <!-- Output previous conversations -->
                <ConversationHistory v-if="authStatus !== 'unauthenticated'" ref="conversationHistory" />


                <!-- Suggested questions -->
                <SuggestedQuestions
                    ref="suggestedQuestions"
                    :chat-messages="chatMessages"
                    @ask-to-chat-bot="submitQuestion"
                />

</template>

<script setup>
// get variables from nuxt.config.ts
const config = useRuntimeConfig();


const newChat = () => {
    if (route.path !== "/chat") {
        navigateTo("/chat");
    }
    // url bar shows a conversation ID, but this instance is without one
    else if (needsRefresh.value) {
        location.href = "/chat";
    } else {
        chatMessages.value = [];
    }
    suggestedQuestions.value.clear();
};


const sendMessage = () => {
    const message = userMessage.value.trim();
    if (message !== "") {
        generating.value = true;

        // set array of suggested questions to zero, to hide template in SuggestedQuestions during response generation
        suggestedQuestions.value.clear();



        fetchEventSource(`${config.public.apiURL}/chat`, {
            // other student's code goes here
            onclose: async () => {
                generating.value = false;

                if (authStatus.value === "authenticated") {
                    const isNewChat = !conversationId.value;

                    if (isNewChat) {
                        // if first question asked create new conversation
                        conversationId.value = await createConversation();

                        history.pushState(null, "", `/chat/${conversationId.value}`);

                        // reload the page on next new conversation, since this is
                        // still technically `/chat` withouth an ID
                        needsRefresh.value = true;
                    }

                    // send new messages to the server
                    addMessages(conversationId.value).then(() => {
                        if (isNewChat) {
                            // update conversation list of left
                            conversationHistory.value.refreshConversations();
                        }
                    });
                }

                // after assistant message is loaded get suggested questions
                suggestedQuestions.value.fetchSuggestedQuestions();
            },
            },
        });
    }
};

// returns conversation history for a given user and specific conversation ID
const getConversationHistory = async inputConversationId => {
    const { token } = useAuth();
    try {
        const { data: conversationHistory } = await useFetch(
            `${config.public.apiURL}/conversations/${inputConversationId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token.value,
                },
            },
        );
        return conversationHistory;
    } catch (error) {
        console.error("Error fetching conversation history: ", error);
    }
};

const chatMessages = conversationId.value ? await getConversationHistory(conversationId.value) : ref([]);

// adds the recent two messages to the tables
// if it's the first question to the chatbot, the title is updated in the database
const addMessages = async inputConversationId => {
    const { token } = useAuth();
    try {
        await $fetch(`${config.public.apiURL}/conversations/${inputConversationId}/add_messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token.value,
            },
            body: {
                // only get the last 2 messages
                // chat_messages: props.chatMessages.slice(-2),
                chat_messages: chatMessages.value.slice(-2),
            },
        }).then(resp => {
            resp.message_ids.forEach((messageId, index) => {
                chatMessages.value[chatMessages.value.length - 2 + index].id = messageId;
            });
        });
    } catch (error) {
        console.error("Error adding to conversation history: ", error);
    }
};

// sends question clicked to the chatBot
const submitQuestion = question => {
    // sets value of user message, so it gets submitted to chatBot
    userMessage.value = question;
    sendMessage();
};

const handleShiftEnter = event => {
    // if enter key pressed but not alongside the shift key
    if (event.key === "Enter" && !event.shiftKey) {
        // sends message to chatbot
        sendMessage();
        event.preventDefault();
    }
};

</script>
