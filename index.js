   let currentProfile = ''; // Define currentProfile outside of DOMContentLoaded

    // Handle Enter key for sending messages
    document.getElementById('chatInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            document.getElementById('sendButton').click();
        }
    });

    // Handle Send button click
    document.getElementById('sendButton').addEventListener('click', async function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        const chatMessages = document.getElementById('chatMessages');
        const typingIndicator = document.getElementById('typingIndicator');

        // Show typing indicator
        typingIndicator.classList.add('visible');

        // Display user message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message user';
        userMsgDiv.innerHTML = `<div class="message-content">${message}</div>`;
        chatMessages.appendChild(userMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        input.value = '';
        input.focus();

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: currentProfile , // Use currentProfile here
                    messages: [
                        { role: "user", content: message },
                    ],
                    stream: false
                })
            });
            const data = await response.json();
            const aiReply = data.message?.content || "No response from AI.";

            // Hide typing indicator
            typingIndicator.classList.remove('visible');

            // Display bot message
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message bot';
            botMsgDiv.innerHTML = `<div class="message-content">${aiReply}</div>`;
            chatMessages.appendChild(botMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            // Hide typing indicator on error as well
            typingIndicator.classList.remove('visible');
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message bot';
            botMsgDiv.innerHTML = `<div class="message-content">Error: ${error.message}</div>`;
            chatMessages.appendChild(botMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
    // Add event listener for the clear chat button
    document.getElementById('clearChatButton').addEventListener('click', function() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <h3>Welcome to AI Chat!</h3>
                <p>Start a conversation by typing a message below. I'm here to help with questions, provide information, or just have a friendly chat!</p>
            </div>
        `;
        document.getElementById('chatInput').value = '';
        document.getElementById('chatInput').focus();
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        const profileDropdownContent = document.getElementById('profileDropdownContent');

        // Function to fetch and populate models
        async function fetchModels() {
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                const data = await response.json();

                // Clear existing options
                profileDropdownContent.innerHTML = '';

                // Populate models
                data.models.forEach(model => {
                    let modelName = model.name;
                    // Remove colon and everything after it
                    if (modelName.includes(':')) {
                        modelName = modelName.substring(0, modelName.indexOf(':'));
                    }
                    const a = document.createElement('a');
                    a.href = '#';
                    a.dataset.profile = modelName;
                    a.textContent = modelName;
                    a.addEventListener('click', function(event) {
                        event.preventDefault();
                        const profile = this.dataset.profile;
                        currentProfile = profile; // Update the currentProfile variable
                        document.getElementById('currentProfileDisplay').textContent = profile; // Update the displayed profile
                        document.getElementById('currentModelText').value = profile; // Update the text box
                        console.log(`Profile selected: ${profile}`); // Log the selected profile
                        profileDropdownContent.style.display = 'none';
                    });
                    profileDropdownContent.appendChild(a);
                });
            } catch (error) {
                console.error('Error fetching models:', error);
                profileDropdownContent.innerHTML = '<p>Error loading profiles.</p>';
            }
        }

        fetchModels();

        document.getElementById('profileDropdownButton').addEventListener('click', function(event) {
            event.stopPropagation();
            profileDropdownContent.style.display = profileDropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', function(event) {
            if (!event.target.closest('.profile-dropdown')) {
                profileDropdownContent.style.display = 'none';
            }
        });
    });

    // JavaScript to toggle dark mode
    document.addEventListener('DOMContentLoaded', function() {
        const checkbox = document.getElementById('checkbox');
        const body = document.body;
        const chatContainer = document.querySelector('.chat-container');
        const chatInputContainer = document.querySelector('.chat-input-container');

        // Function to toggle dark mode
        function toggleDarkMode() {
            body.classList.toggle('dark-mode');
            chatContainer.classList.toggle('dark-mode');
            chatInputContainer.classList.toggle('dark-mode');

            // Store the user's preference in localStorage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        }

        // Check if dark mode was previously enabled
        if (localStorage.getItem('darkMode') === 'enabled') {
            checkbox.checked = true;
            toggleDarkMode();
        }

        // Event listener for the checkbox
        checkbox.addEventListener('change', toggleDarkMode);
    });