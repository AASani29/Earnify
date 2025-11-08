import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Extract skills from text using AI
 */
export async function extractSkills(text: string): Promise<string[]> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a skill extraction assistant. Extract relevant professional skills from the given text. 
Return ONLY a JSON array of skills as strings. Each skill should be concise (1-3 words).
Focus on technical skills, soft skills, and job-related competencies.
Example output: ["JavaScript", "React", "Communication", "Problem Solving"]`,
        },
        {
          role: 'user',
          content: `Extract skills from this text:\n\n${text}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || '[]'
    
    // Parse the JSON response
    try {
      const skills = JSON.parse(response)
      return Array.isArray(skills) ? skills.filter((s: any) => typeof s === 'string') : []
    } catch {
      // If JSON parsing fails, try to extract skills from text
      const matches = response.match(/"([^"]+)"/g)
      return matches ? matches.map(m => m.replace(/"/g, '')) : []
    }
  } catch (error) {
    console.error('Error extracting skills:', error)
    return []
  }
}

/**
 * Calculate match score between worker and task
 */
export async function calculateMatchScore(
  workerProfile: {
    skills: string[]
    location?: { city?: string; area?: string }
    rating: { average: number; count: number }
    hourlyRate?: number
    reviews?: Array<{
      rating: number
      comment?: string
      skills?: string[]
      professionalism?: number
      communication?: number
      quality?: number
    }>
  },
  task: {
    skillsRequired: string[]
    location: { city: string; district: string }
    budget: number
    category: string
  }
): Promise<{ score: number; reasons: string[] }> {
  try {
    // Build review summary if available
    let reviewSummary = ''
    if (workerProfile.reviews && workerProfile.reviews.length > 0) {
      const avgProfessionalism = workerProfile.reviews
        .filter(r => r.professionalism)
        .reduce((sum, r) => sum + (r.professionalism || 0), 0) / workerProfile.reviews.length
      const avgCommunication = workerProfile.reviews
        .filter(r => r.communication)
        .reduce((sum, r) => sum + (r.communication || 0), 0) / workerProfile.reviews.length
      const avgQuality = workerProfile.reviews
        .filter(r => r.quality)
        .reduce((sum, r) => sum + (r.quality || 0), 0) / workerProfile.reviews.length

      const recentComments = workerProfile.reviews
        .filter(r => r.comment)
        .slice(0, 3)
        .map(r => r.comment)
        .join('; ')

      reviewSummary = `
- Professionalism: ${avgProfessionalism ? avgProfessionalism.toFixed(1) + '/5' : 'N/A'}
- Communication: ${avgCommunication ? avgCommunication.toFixed(1) + '/5' : 'N/A'}
- Quality: ${avgQuality ? avgQuality.toFixed(1) + '/5' : 'N/A'}
- Recent feedback: ${recentComments || 'No comments'}`
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a job matching assistant. Calculate a match score (0-100) between a worker and a task.
Consider: skill match, location proximity, budget compatibility, worker rating, and past reviews.
Return ONLY a JSON object with this structure:
{
  "score": 85,
  "reasons": ["Strong skill match", "Same city", "Budget aligned", "Excellent reviews"]
}`,
        },
        {
          role: 'user',
          content: `Worker Profile:
- Skills: ${workerProfile.skills.join(', ')}
- Location: ${workerProfile.location?.city || 'Not specified'}, ${workerProfile.location?.area || ''}
- Rating: ${workerProfile.rating.average}/5 (${workerProfile.rating.count} reviews)
- Hourly Rate: ${workerProfile.hourlyRate ? `৳${workerProfile.hourlyRate}` : 'Not specified'}
${reviewSummary}

Task:
- Category: ${task.category}
- Required Skills: ${task.skillsRequired.join(', ')}
- Location: ${task.location.city}, ${task.location.district}
- Budget: ৳${task.budget}

Calculate the match score and provide reasons.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 300,
    })

    const response = completion.choices[0]?.message?.content || '{}'

    try {
      const result = JSON.parse(response)
      return {
        score: typeof result.score === 'number' ? result.score : 0,
        reasons: Array.isArray(result.reasons) ? result.reasons : [],
      }
    } catch {
      return { score: 0, reasons: [] }
    }
  } catch (error) {
    console.error('Error calculating match score:', error)
    return { score: 0, reasons: [] }
  }
}

/**
 * Get AI recommendations for tasks based on worker profile
 */
export async function getTaskRecommendations(
  workerProfile: {
    skills: string[]
    location?: { city?: string }
    rating: { average: number }
    experience?: string
    completedTasks?: number
    reviews?: Array<{
      comment?: string
      skills?: string[]
    }>
  },
  availableTasks: Array<{
    _id: string
    title: string
    category: string
    skillsRequired: string[]
    location: { city: string }
    budget: number
  }>
): Promise<string[]> {
  try {
    // Build worker context
    let workerContext = `Worker Profile:
- Skills: ${workerProfile.skills.join(', ')}
- Location: ${workerProfile.location?.city || 'Not specified'}
- Rating: ${workerProfile.rating.average}/5
- Completed Tasks: ${workerProfile.completedTasks || 0}`

    if (workerProfile.experience) {
      workerContext += `\n- Experience: ${workerProfile.experience.substring(0, 200)}`
    }

    if (workerProfile.reviews && workerProfile.reviews.length > 0) {
      const skillsFromReviews = workerProfile.reviews
        .flatMap(r => r.skills || [])
        .filter((v, i, a) => a.indexOf(v) === i) // unique
      if (skillsFromReviews.length > 0) {
        workerContext += `\n- Skills validated by clients: ${skillsFromReviews.join(', ')}`
      }
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a task recommendation assistant. Recommend the best tasks for a worker based on their profile and past performance.
Return ONLY a JSON array of task IDs in order of best match.
Example: ["task_id_1", "task_id_2", "task_id_3"]`,
        },
        {
          role: 'user',
          content: `${workerContext}

Available Tasks:
${availableTasks.map(t => `- ID: ${t._id}, Title: ${t.title}, Category: ${t.category}, Skills: ${t.skillsRequired.join(', ')}, Location: ${t.location.city}, Budget: ৳${t.budget}`).join('\n')}

Recommend the top tasks for this worker (return task IDs only).`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || '[]'

    try {
      const taskIds = JSON.parse(response)
      return Array.isArray(taskIds) ? taskIds.filter((id: any) => typeof id === 'string') : []
    } catch {
      // Try to extract IDs from text
      const matches = response.match(/"([^"]+)"/g)
      return matches ? matches.map(m => m.replace(/"/g, '')) : []
    }
  } catch (error) {
    console.error('Error getting task recommendations:', error)
    return []
  }
}

/**
 * Get AI recommendations for workers based on task
 */
export async function getWorkerRecommendations(
  task: {
    title: string
    category: string
    skillsRequired: string[]
    location: { city: string }
    budget: number
  },
  availableWorkers: Array<{
    _id: string
    userId: string
    skills: string[]
    location?: { city?: string }
    rating: { average: number; count: number }
    hourlyRate?: number
    completedTasks?: number
    experience?: string
    reviews?: Array<{
      rating: number
      comment?: string
      professionalism?: number
      communication?: number
      quality?: number
    }>
  }>
): Promise<string[]> {
  try {
    // Build worker descriptions with review data
    const workerDescriptions = availableWorkers.map(w => {
      let desc = `- User ID: ${w.userId}, Skills: ${w.skills.join(', ')}, Location: ${w.location?.city || 'Not specified'}, Rating: ${w.rating.average}/5 (${w.rating.count} reviews), Rate: ${w.hourlyRate ? `৳${w.hourlyRate}/hr` : 'N/A'}, Completed: ${w.completedTasks || 0} tasks`

      if (w.reviews && w.reviews.length > 0) {
        const avgProf = w.reviews.filter(r => r.professionalism).reduce((sum, r) => sum + (r.professionalism || 0), 0) / w.reviews.length
        const avgComm = w.reviews.filter(r => r.communication).reduce((sum, r) => sum + (r.communication || 0), 0) / w.reviews.length
        const avgQual = w.reviews.filter(r => r.quality).reduce((sum, r) => sum + (r.quality || 0), 0) / w.reviews.length

        if (avgProf) desc += `, Professionalism: ${avgProf.toFixed(1)}/5`
        if (avgComm) desc += `, Communication: ${avgComm.toFixed(1)}/5`
        if (avgQual) desc += `, Quality: ${avgQual.toFixed(1)}/5`
      }

      return desc
    })

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a worker recommendation assistant. Recommend the best workers for a task based on skills, ratings, reviews, and past performance.
Return ONLY a JSON array of worker user IDs in order of best match.
Example: ["user_id_1", "user_id_2", "user_id_3"]`,
        },
        {
          role: 'user',
          content: `Task:
- Title: ${task.title}
- Category: ${task.category}
- Required Skills: ${task.skillsRequired.join(', ')}
- Location: ${task.location.city}
- Budget: ৳${task.budget}

Available Workers:
${workerDescriptions.join('\n')}

Recommend the top workers for this task (return user IDs only).`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || '[]'

    try {
      const workerIds = JSON.parse(response)
      return Array.isArray(workerIds) ? workerIds.filter((id: any) => typeof id === 'string') : []
    } catch {
      // Try to extract IDs from text
      const matches = response.match(/"([^"]+)"/g)
      return matches ? matches.map(m => m.replace(/"/g, '')) : []
    }
  } catch (error) {
    console.error('Error getting worker recommendations:', error)
    return []
  }
}

