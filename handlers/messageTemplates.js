// Builds the Instagram message payload for "text with one URL button"
function buildMessage(response) {
  if (!response?.text || !response?.button_title || !response?.button_url) {
    throw new Error('Response requires text, button_title, and button_url');
  }
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: response.text,
        buttons: [
          {
            type: 'web_url',
            title: response.button_title,
            url: response.button_url,
          },
        ],
      },
    },
  };
}

module.exports = buildMessage;