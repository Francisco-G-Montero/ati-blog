import React from 'react';
import './App.css';
import CreatePost from './components/CreatePost';
import DisplayPosts from './components/DisplayPosts';
import { withAuthenticator } from 'aws-amplify-react';
import '@aws-amplify/ui/dist/style.css';

function App() {
  return (
    <div className="App">
      <CreatePost />
      <DisplayPosts />
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
