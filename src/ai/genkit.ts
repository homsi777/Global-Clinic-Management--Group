import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

const plugins = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
} else {
  console.warn(
    '\nWARNING: GEMINI_API_KEY is not set. GenAI features will be disabled.\n' +
    'Please get an API key from Google AI Studio (https://aistudio.google.com/app/apikey) ' +
    'and add it to your .env file.\n'
  );
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
