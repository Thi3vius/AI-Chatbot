
import {NextResponse} from 'next/server' 
import OpenAI from 'openai' 

const systemPrompt = `Welcome to HeadstarterAI Support! How can I assist you today?

At HeadstarterAI, we specialize in AI-powered mock interviews to help you prepare for software engineering job interviews. Whether you need help with scheduling a session, understanding our features, or resolving any technical issues, I’m here to help.

Please let me know what you need assistance with:

Scheduling a Mock Interview
Understanding Platform Features
Technical Support
Account and Billing Questions
Other Inquiries
Just type your question or issue, and I’ll do my best to assist you!`

export async function POST(req) {
  const openai = new OpenAI() 
  const data = await req.json() 

  
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], 
    model: 'gpt-3.5-turbo', 
    stream: true, 
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() 
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content 
          if (content) {
            const text = encoder.encode(content) 
            controller.enqueue(text) 
          }
        }
      } catch (err) {
        controller.error(err) 
      } finally {
        controller.close() 
      }
    },
  })

  return new NextResponse(stream) 
}
