const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: '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',
});

// Function to process chat completions and return only the content
const processChatCompletions = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: `Please summarize the following transcription. And dont do this more than that. Give crisp and concise summary of given prompt`},
          { role: 'user', content: prompt },
        ],
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai.apiKey}`,
        },
      }
    );

    const outputContent = response.data.choices[0].message.content;

    return outputContent;
  } catch (error) {
    console.error("Error processing chat completions:", error.message);
    throw error; // You can handle or log the error as needed
  }
};

module.exports = processChatCompletions;
