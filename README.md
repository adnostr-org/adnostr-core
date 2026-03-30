# AdNostr-Core v2.9

A high-performance FastAPI backend that bridges TikTok traffic with the Nostr protocol through AI-powered advertisement generation and automated social media posting.

## 🚀 Version 2.9 Highlights
- **Complete Apify Token Integration**: Transition from hardcoded auth to Apify Token-driven authorization
- **Security Middleware Enhancements**: Whitelist routes and proper token validation
- **Frontend Security Fixes**: Resolved white screen crashes and improved error handling
- **Shakespeare UI Compliance**: All new components follow minimalist hacker aesthetic
- **Token Management System**: Full lifecycle management for Apify API tokens

## Overview

AdNostr-Core is a sophisticated backend service designed to:

- Generate AI-powered advertisements (beauty images and product images)
- Automatically post content to Mastodon instances (admin.adnostr.org)
- Track advertisement clicks and calculate revenue attribution
- Bridge TikTok traffic with Nostr protocol integration
- Provide multi-account Mastodon management via toot CLI

## Technology Stack

- **FastAPI**: High-performance async web framework
- **Mastodon.py**: Mastodon API client library
- **Python-dotenv**: Environment configuration management
- **Subprocess**: Toot CLI integration for multi-account support
- **Pillow**: Image processing and optimization
- **NumPy**: Mathematical computations for revenue calculations
- **Structlog**: Structured logging for production monitoring

## Key Features

### AI-Powered Advertisement Generation
- Text-to-image generation for beauty and product advertisements
- Configurable prompts and styles
- Automatic image optimization for social media
- Revenue estimation using advanced algorithms

### Automated Social Media Posting
- Direct Mastodon API integration
- Media upload and status posting
- #adnostr hashtag automation
- Multi-account support via toot CLI

### Revenue Attribution System
Uses the formula: `R = (C × ln(I + 1)) / D^k`
- **R**: Revenue estimate
- **C**: Configurable constant factor
- **I**: Image complexity factor (based on prompt and type)
- **D**: Difficulty factor (based on image dimensions)
- **k**: Configurable exponent factor

### Click Tracking & Analytics
- Real-time click attribution
- Source-based revenue multipliers (TikTok premium, etc.)
- Comprehensive analytics dashboard
- Privacy-preserving IP hashing

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd adnostr-core
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `False` |
| `MASTODON_BASE_URL` | Mastodon instance URL | `https://admin.adnostr.org` |
| `MASTODON_ACCESS_TOKEN` | Mastodon API token | Required |
| `AI_API_KEY` | AI image generation API key | Required for AI features |
| `REVENUE_CONSTANT_C` | Revenue calculation constant | `1.5` |
| `REVENUE_EXPONENT_K` | Revenue calculation exponent | `0.8` |
| `TOOT_CONFIG_DIR` | Toot CLI config directory | Optional |
| `TOOT_ACTIVE_ACCOUNT` | Default toot account | `adnostr-admin` |

### Mastodon Setup

1. Register an application on your Mastodon instance
2. Obtain API credentials (client_id, client_secret, access_token)
3. Configure the credentials in your `.env` file

### Toot CLI Setup (Optional)

For multi-account support:

```bash
# Install toot CLI
pip install toot

# Login to multiple accounts
toot login --account account1
toot login --account account2

# Set TOOT_CONFIG_DIR in .env to your toot config directory
```

## Usage

### Starting the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Endpoints

#### POST `/api/v1/post_ad`
Generate and post an advertisement to Mastodon.

**Request Body:**
```json
{
  "prompt": "Beautiful sunset over mountains with lake",
  "image_type": "beauty",
  "description": "Amazing nature view",
  "style": "photorealistic",
  "brand_elements": ["nature", "adventure"]
}
```

**Response:**
```json
{
  "success": true,
  "post_id": "123456789",
  "post_url": "https://admin.adnostr.org/@user/123456789",
  "revenue_estimate": 2.45,
  "processing_time": 3.21,
  "metadata": {
    "image_type": "beauty",
    "generation_time": 3.21
  }
}
```

#### POST `/api/v1/click_track`
Track advertisement clicks for revenue attribution.

**Request Body:**
```json
{
  "post_id": "123456789",
  "click_source": "tiktok",
  "campaign_id": "summer_campaign"
}
```

#### GET `/api/v1/analytics/{post_id}`
Get analytics for a specific advertisement post.

#### GET `/health`
Health check endpoint.

## Development

### Project Structure

```
adnostr-core/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
├── src/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py      # API endpoint definitions
│   ├── engine/
│   │   ├── __init__.py
│   │   └── ad_generator.py # AI advertisement generation
│   └── utils/
│       ├── __init__.py
│       └── mastodon_client.py # Mastodon API wrapper
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Quality

```bash
# Type checking
mypy src/

# Linting
flake8 src/

# Formatting
black src/
```

## Architecture

### Core Components

1. **AdGenerator**: Handles AI-powered image generation with revenue calculation
2. **MastodonClient**: Provides Mastodon API integration and toot CLI support
3. **API Routes**: FastAPI endpoints for advertisement posting and click tracking
4. **Revenue Engine**: Implements the `R = (C × ln(I + 1)) / D^k` formula

### Async Processing

The application uses async/await throughout for high performance:
- Concurrent AI image generation
- Parallel Mastodon API calls
- Background task processing for analytics

### Error Handling

Comprehensive error handling with:
- Structured logging via structlog
- Custom exception classes
- Graceful degradation for AI service failures
- Retry logic for transient network errors

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### Production Considerations

- Use a production WSGI server (gunicorn/uvicorn)
- Set up proper logging aggregation
- Configure database for persistent storage
- Implement rate limiting and authentication
- Set up monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or support:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ for the Nostr community**