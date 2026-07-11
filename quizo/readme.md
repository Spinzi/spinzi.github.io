# QUIZO

A simple app hosted with Github. It is live thanks to Firebase, and you can create your own quiz - then take it or other quizzes with the 6 digit code. <br>
I created it because I really wanted to assign some kaoot quizzes, but unfortunately, it stars from over $20 - money I dont have, but I do have some knowledge in CS so I made it work. 

[Git repo](https://github.com/Spinzi/spinzi.github.io/tree/main/quizo)<br>
[Test it here](https://spinzi.github.io/quizo/)<br>
[Or test a simple 3 questions quiz ](https://spinzi.github.io/quizo/?page=quiz&id=TA653B)
<br>You can always contact me through [GitHub](https://github.com/Spinzi) or Slack(@spinzi) or just drop a mail to [me](mailto:alinnicusorgisca@gmail.com)

## Limitations

The app is completely functional, but not buttery smooth - it still has limitations, the leaderboard is fetched at the ending of the quiz and doesnt update, you cant upload pictures, you dont have a light or dark mode, and other small things. 

## How did I do it

Its suprising how great of a job Vanilla HTML CSS and JS can do. <br>
I began by marking what I want - a welcome menu with buttons for creating a quiz and taking one. Then I thought of what I need, a place to store the quizzes - a database, but live for everyone to see. That was Firebase with Firestore and Auth. Next up are the design choices - the CSS I did later but I needed a complete picture of what I want to create.

```
Welcome page - take or create quiz
   Dashboard(for creating the quiz) - lands you to a login page if not logged
      Create a quiz
      Logout
      Copy links to your quizzes or delete them
   Quiz taker
      Enter a quiz code and take it
```

Then I made a structure for the files in the Firestore<br> 
I decided in having a \users and \quizzes <br>
In user i stored things like email, name, pfp, etc<br>
Inside quizzes i stored each quiz, with its folder name being the code for access. 
![Photo of firestore](https://stardance.hackclub.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTMxNzExLCJwdXIiOiJibG9iX2lkIn19--16d18ad6cd15b7f7bab07349b2f32da2ec2163ca/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwicmVzaXplX3RvX2xpbWl0IjpbMTYwMCw5MDBdLCJzYXZlciI6eyJzdHJpcCI6dHJ1ZSwicXVhbGl0eSI6NzV9fSwicHVyIjoidmFyaWF0aW9uIn19--3bc8a2c9d65e3b087c0c0b37dcfb642bb247bc73/image.png)
For utility I stored the timestamp of creation date, the owner, title, and all questions in an array<br><br>
Then the website itself. For making my life a little easier I followed the design of many folders and files, especially for JS. To make buttons and actions easier to follow, for bigger actions i use [data-action]="name of action". Then I added an event listener to the body element, and get the closest - if the closest element has dataset.action !== null, then I proceed with the code. <br>
It also helps me to things like goto-12AB67 and if `action.startsWith("goto-")` I can send it to `?page=quiz&id=12AB67` - and no its not a valid quiz so dont test it. This one is tho `TA653B`, so you can try it if you want.
<br>
I split pages into their own functions. I barely use raw HTML, most stuff I do in JS, and for proper style management, I used a common variables CSS file, and loaded page specific CSS with a `loadCSS()` function.<br>
The pages are separated in `js/components/pages`
- `createQuiz.js`
- `dashboard.js`
- `home.js`
- `quiz.js`
<br>
For things like the auth page, i simply added an onAuthCheck separator, if logged render the dashboard, if not render login, and for createQuiz if logged render, if not goto-dashboard -> login
<br>
Here is a photo of the layout since I was working
![img of vscode](https://stardance.hackclub.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTMxMzM2LCJwdXIiOiJibG9iX2lkIn19--2f6a7fbfb21bf28d8427ca56b9388ffc8296932e/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwicmVzaXplX3RvX2xpbWl0IjpbMTYwMCw5MDBdLCJzYXZlciI6eyJzdHJpcCI6dHJ1ZSwicXVhbGl0eSI6NzV9fSwicHVyIjoidmFyaWF0aW9uIn19--3bc8a2c9d65e3b087c0c0b37dcfb642bb247bc73/image.png)
Since then I added many more things, but its good as a reference
<br>
Also my first CSS didnt look close to as good as now. Because I just wanted to have it working
![first model](https://stardance.hackclub.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTMzMTIwLCJwdXIiOiJibG9iX2lkIn19--b1421aee6489e643bdc2a7fae632d5d651a4e843/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwicmVzaXplX3RvX2xpbWl0IjpbMTYwMCw5MDBdLCJzYXZlciI6eyJzdHJpcCI6dHJ1ZSwicXVhbGl0eSI6NzV9fSwicHVyIjoidmFyaWF0aW9uIn19--3bc8a2c9d65e3b087c0c0b37dcfb642bb247bc73/image.png)
![final model](https://stardance.hackclub.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTM5Nzg1LCJwdXIiOiJibG9iX2lkIn19--9a5d635b206664419023f7eb837d5faa1c1548aa/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwicmVzaXplX3RvX2xpbWl0IjpbMTYwMCw5MDBdLCJzYXZlciI6eyJzdHJpcCI6dHJ1ZSwicXVhbGl0eSI6NzV9fSwicHVyIjoidmFyaWF0aW9uIn19--3bc8a2c9d65e3b087c0c0b37dcfb642bb247bc73/Screenshot%202026-07-10%20194148.png)
The background is also animated, I will let you be the judges, but Im happier with this result. It feels more alive, and its inspired from Stranger things, i used this app to give me the background patterns for free and then I changed the colors, set opacity to default and applied the animation. <br>[The website for css bg is this one](https://www.magicpattern.design/tools/css-backgrounds)

## About AI

I can't deny that I used AI in this project. I used it for basic things like creating a folder structure, helping me catch bugs, giving a hand on the syntax and explaining to me how to use Firebase(as I didn't use it in a while). I don't like AI doing too much, as I experienced having to redo whole projects because I had no idea what was going on.