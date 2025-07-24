'use server';

/**
 * @fileOverview Implements a Genkit flow to automatically announce the next patient's name and room number using speech synthesis.
 * 
 * - announceNextPatient - A function that triggers the announcement process.
 * - AnnounceNextPatientInput - The input type for the announceNextPatient function.
 * - AnnounceNextPatientOutput - The return type for the announceNextPatient function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AnnounceNextPatientInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  patientId: z.string().describe('The ID of the patient.'),
  roomNumber: z.number().describe('The room number for the patient.'),
});
export type AnnounceNextPatientInput = z.infer<typeof AnnounceNextPatientInputSchema>;

const AnnounceNextPatientOutputSchema = z.object({
  media: z.string().describe('The audio data URI in WAV format containing the announcement.'),
});
export type AnnounceNextPatientOutput = z.infer<typeof AnnounceNextPatientOutputSchema>;

export async function announceNextPatient(input: AnnounceNextPatientInput): Promise<AnnounceNextPatientOutput> {
  return announceNextPatientFlow(input);
}

const announcePrompt = ai.definePrompt({
  name: 'announcePatientPrompt',
  input: {schema: AnnounceNextPatientInputSchema},
  prompt: `Announce the following patient details:\nPatient Name: {{{patientName}}}\nPatient ID: {{{patientId}}}\nRoom Number: {{{roomNumber}}}`,
});


const announceNextPatientFlow = ai.defineFlow(
  {
    name: 'announceNextPatientFlow',
    inputSchema: AnnounceNextPatientInputSchema,
    outputSchema: AnnounceNextPatientOutputSchema,
  },
  async input => {
    // const announcementText = await announcePrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: `Announcing patient ${input.patientName}, patient ID ${input.patientId}, please proceed to room number ${input.roomNumber}.`,
    });

    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
