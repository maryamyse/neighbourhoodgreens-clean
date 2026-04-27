# Neighbourhood Greens

An e-commerce platform for fresh produce and grocery delivery with AI-powered recommendations and M-Pesa integration.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Django, Django REST Framework, JWT
- **APIs**: Google Gemini AI, Safaricom M-Pesa

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/maryamyse/neighbourhoodgreens-clean.git
cd neighbourhoodgreens-clean

# Backend setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt
cd django_backend
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
npm install
npm run dev
