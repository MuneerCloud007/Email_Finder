import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Profile schema
const ProfileSchema = new Schema({
  profile: {
    fullName: { type: String, default: 'N/A' },
    designation: [{ type: String, default: 'N/A' }],
    personLocation: { type: String, default: 'N/A' },
    connections: { type: String, default: 'N/A' },
    currentRoles: [
      {
        designation: { type: String, default: 'N/A' },
        companyUrl: { type: String, default: 'N/A' },
        date: { type: String, default: 'N/A' }
      }
    ],
    socialMedia: [
      {
        name: { type: String, default: 'N/A' },
        url: { type: String, default: 'N/A' },
        socialMedia: { type: String, default: 'other' }
      }
    ]
  },
  about: {
    heading: { type: String, default: 'N/A' },
    content: { type: String, default: 'N/A' }
  },
  relationship: {
    sectionHeading: { type: String, default: 'N/A' },
    conversation: {
      heading: { type: String, default: 'N/A' },
      text: { type: String, default: 'N/A' }
    },
    recentActivity: {
      heading: { type: String, default: 'N/A' },
      text: { type: String, default: 'N/A' },
      details: [
        {
          personName: { type: String, default: 'N/A' },
          action: { type: String, default: 'N/A' },
          time: { type: String, default: 'N/A' },
          content: { type: String, default: 'N/A' },
          reactions: { type: String, default: 'N/A' },
          replies: { type: String, default: 'N/A' }
        }
      ]
    },
    sharedInCommon: {
      heading: { type: String, default: 'N/A' },
      text: { type: String, default: 'N/A' }
    },
    getIntroduced: {
      heading: { type: String, default: 'N/A' },
      text: { type: String, default: 'N/A' },
      emptyState: {
        text: { type: String, default: 'N/A' },
        link: { type: String, default: 'N/A' }
      }
    }
  },
  experience: [
    {
      companyName: { type: String, default: 'N/A' },
      jobTitle: { type: String, default: 'N/A' },
      logoUrl: { type: String, default: 'N/A' },
      duration: { type: String, default: 'N/A' },
      location: { type: String, default: 'N/A' },
      description: { type: String, default: 'N/A' }
    }
  ],
  education: [
    {
      schoolName: { type: String, default: 'N/A' },
      logoUrl: { type: String, default: 'N/A' },
      details: [String] // Array of strings
    }
  ],
  interests: [
    {
      name: { type: String, default: 'N/A' }
    }
  ],
  skills: [
    {
      skill: { type: String, default: 'N/A' }
    }
  ],
  endorsements: [
    {
      skill: { type: String, default: 'N/A' },
      count: { type: String, default: 'N/A' }
    }
  ],
  languages: [
    {
      language: { type: String, default: 'N/A' },
      proficiency: { type: String, default: 'N/A' }
    }
  ]
});

// Create and export the model
const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;
