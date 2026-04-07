# Why are you on...

Note: this extension is very much WIP and is in the middle of going through the Google extension review process

### An extension to nudge you against spending too much time on websites of your choice

If you're a power user of the modern web you may have fallen victim in doomscrolling on many websites whether it be Youtube binges, twitter threads or just plain Reddit.
You may have also tried to fight it by setting usage limits on the websites or by installing blocking extensions. Unfortunately those solutions usually have glaring issues:

 - built-in usage blockers (like the usage reminders on YouTube and Instagram) are not good at taking you out of consuming as you can always snooze them. This means they rely on willpower which you can't rely on long term as over time a user will just get better and better at tuning out the snooze animation.
 - cold-turkey blocking extensions don't work either because it's too easy for a power user to disable the extension, as it can become an automatic process to go into extensions and turn the blocker off

So what do we do then? What we'll do is make an extension that forcibly makes you think but the thinking is brief enough that it's less effort to "snap out of the doomscroll" than to turn off the extension.
Here's how it works:

 - You set a list of domains you want to block and a time limit
 - Once the time limit is up, on the next website visit on the domain all the extension does is show a popup modal
 - In the popup modal you have a text field and you are prompted to write "why are you on this website right now"
 - You are free to type anything and everything, and can dismiss the modal after 10 seconds are up and you have typed at least 5 words. At that point, the timer refreshes.

The idea is to force the user to think before continuing, and to make the inconvenience short enough that they won't bother turning off the extension at a time of missing willpower. If you think, you'll snap out of the doomscroll, and thus possibly close the tab instead of continuing.

Oh and for funzies, every weekend the extension will open up a tab with the previous week's entries as a sort of weekly review.

### Installation, building and contributing

As mentioned above, this is very WIP but documentation the next focus so this will be up soon. 
