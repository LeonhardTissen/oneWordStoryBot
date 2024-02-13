const { Client, GatewayIntentBits, ActivityType, Partials } = require("discord.js");
const client = new Client({
	intents: Object.values(GatewayIntentBits),
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
});
const fs = require('fs');

// Load token from .env file
const env = require('dotenv').config().parsed;

const maxUsers = 3; // Maximum number of consecutive users allowed to contribute

let story = ''; // The story string
let lastUsers = []; // Array to store the last users who contributed
let storyMessage = null; // The message object of the story
const storyChannelId = '1207024002296455168';

client.once('ready', () => {
	console.log('Bot is ready');
	client.user.setPresence({ 
		activities: [{ 
			name: 'story.Warze.org', 
			type: ActivityType.Listening,
		}], 
		status: 'idle' 
	});
});

const api = 'https://wild-erin-harp-seal-vest.cyclic.app/ww';

async function verifyWord(word) {
	console.log(`Verifying word: ${word}`);
	const response = await fetch(`${api}/check?word=${word}`);
	const responseObject = await response.json();
	console.log(responseObject);
	return responseObject.result;
}

function addToLogFile(message) {
	const path = require('path');
	const filePath = path.join(__dirname, 'log.txt');
	fs.appendFileSync(filePath, message + '\n');
}

client.on('messageCreate', async message => {
    // Ignore messages from the bot itself and messages without the prefix
    if (message.author.bot) return;

	// Ignore messages from other channels
	if (message.channel.id !== storyChannelId) return;

	// Log the user's message
	const logMessage = `${message.author.username} (${message.author.id}): ${message.content}`;
	addToLogFile(logMessage);
	console.log(logMessage);

	// Delete the user's message
	message.delete();

    if (lastUsers.includes(message.author.id)) {
		// Send private message to the user
		message.author.send('You have already contributed to the story. Please wait for others to contribute before you can contribute again.');
		return;
	}

	// Check if the message is either ?, . or ! these are allowed to end
	if (!['?', '.', '!', '...'].includes(message.content)) {

		// Verify if the message is only a single, alphanumeric word
		if (!/^\w+$/.test(message.content)) {
			// Send private message to the user
			message.author.send('Your message should only contain a single, alphanumeric word.');
			return;
		}
	
		// Verify that the word is valid
		const isValidWord = await verifyWord(message.content);
		if (!isValidWord) {
			// Send private message to the user
			message.author.send('Your message should be a valid word.');
			return;
		}

		return;
	}

	// Add the user to the lastUsers array
	lastUsers.push(message.author.id);

	// If the lastUsers array is larger than the maxUsers, remove the first element
	if (lastUsers.length > maxUsers) {
		lastUsers.shift();
	}

	const append = message.content + ' ';

	// Add the user's message to the story
	story += append;

	if (story.length > 2000) {
		// Send a new message if the story is too long
		story = append;
		storyMessage = await message.channel.send(story);
	} else if (storyMessage) {
		storyMessage.edit(story);
	} else {
		// Send the story message
		storyMessage = await message.channel.send(story);
	}

	console.log(lastUsers);
});

// Login to Discord with your app's token
client.login(env.TOKEN);
