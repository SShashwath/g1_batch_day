// src/App.js
import './App.css';
import Poll from './Poll';

const awards = [
    { title: "Mr./Ms. Always Late", description: "Makes grand entrances to class — usually after roll call." },
    { title: "Backbencher Boss", description: "Silently ruling the last bench like a mafia don." },
    { title: "The Walking Google", description: "Knows every answer — even the ones not in the syllabus." },
    { title: "Unsung Hero / Heroine", description: "Does all the work behind the scenes but never asks for credit." },
    { title: "Sleeper Hit", description: "Sleeps in class, tops in marks — science still can’t explain it." },
    { title: "Kalakkal Comedian", description: "Turns every situation into a comedy show — laughter guaranteed." },
    { title: "Flash Entry", description: "Appears suddenly, like they teleported." },
    { title: "Lab Partner Goals", description: "The duo who carry each other through every practical — true lab loyalty." },
    { title: "Assignment Copy Center", description: "Shares notes and assignments faster than Xerox shops." },
    { title: "The Helping Hand", description: "Always ready to support friends — emotionally and academically." },
    { title: "Silent Achiever", description: "Quiet in class, loud on results day." },
    { title: "Team Spirit Award", description: "Brings unity and good vibes to every group activity." },
    { title: "Creative Mind", description: "The aesthetic brain behind posters, videos, and ideas." },
    { title: "Born Leader", description: "Can handle any crisis — from group projects to class drama." },
    { title: "Kindest Soul", description: "Soft-spoken, warm-hearted, everyone’s comfort person." },
    { title: "The Motivator", description: "Pushes others to do better, even when they’re ready to give up." },
    { title: "Best Smile", description: "Their smile works like Ctrl+Z for a bad day." },
    { title: "Fashion Icon", description: "No repeat outfits. Always ready for an insta story." },
    { title: "Chameleon Award 🦎", description: "Jumps from one group to another depending on their need. Adapt to everyone." },
    { title: "Egoless Friend of the Class", description: "Helps everyone without expecting anything in return — pure hearted and drama-free." }
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Batch Day Awards</h1>
        {awards.map((award, index) => (
          <Poll key={index} title={award.title} description={award.description} />
        ))}
      </header>
    </div>
  );
}

export default App;