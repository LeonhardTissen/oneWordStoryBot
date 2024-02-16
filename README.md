# oneWordStoryBot

A Discord Bot allowing Users to write a story, one word at a time.

## Setup

### Install dependencies:
```
npm i
```

### Rename example.env to .env and fill in the required information:
```env
TOKEN=YOUR_BOT_TOKEN_HERE
CHANNEL=1207024002296455168
USERBLOCK=3
VERIFY=yes
```

- `TOKEN`: The bot token you get from the Discord Developer Portal.
- `CHANNEL`: The channel ID where the bot should listen and write the story.
- `USERBLOCK`: The amount of users that can't write a word if the already wrote a word recently.
- `VERIFY`: If set to "yes", the bot will verify if the word is a valid word in the English language.

### Run the bot script:
```
node main.js
```

## Usage

- In the channel of your choice, users must send a word between 1-20 characters or one of the following: . , ... ? !
- Messages that don't abide by this are not added to the story and the user is notified directly.
- A new story will be started either when it reaches 2000 characters (Discord limit) or a user says "end of story", all other messages are deleted.
- A user cannot send multiple words consequtively and must wait for other users to contribute. The amount of users needed for the flow of a story can be configured.

### If you enjoy this bot, please leave a Star ⭐

<p align="center">
	<img src="https://s.warze.org/paddingleft3.png" style="display: inline-block;"><a href="https://twitter.warze.org" style="text-decoration: none;"><img src="https://s.warze.org/x3.png" alt="Leonhard Tissen on X/Twitter" style="display: inline-block;"/></a><a href="https://youtube.warze.org" style="text-decoration: none;"><img src="https://s.warze.org/youtube3.png" alt="Leonhard Tissen on YouTube" style="display: inline-block;"/></a><a href="https://linkedin.warze.org" style="text-decoration: none;"><img src="https://s.warze.org/linkedin3.png" alt="Leonhard Tissen on LinkedIn" style="display: inline-block;"/></a><a href="https://github.warze.org" style="text-decoration: none;"><img src="https://s.warze.org/github3.png" alt="Leonhard Tissen on GitHub" style="display: inline-block;"/></a><a href="https://gitlab.warze.org" style="text-decoration: none;"><img src="https://s.warze.org/gitlab3.png" alt="Leonhard Tissen on GitLab" style="display: inline-block;"/></a><img src="https://s.warze.org/paddingright2.png">
</p>
