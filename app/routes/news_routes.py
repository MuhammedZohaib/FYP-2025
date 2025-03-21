from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup
from dateutil.parser import parse  # pip install python-dateutil
from datetime import datetime

router = APIRouter()

def parse_date(date_str):
    try:
        return parse(date_str)
    except Exception:
        return None

def scrape_healthline():
    url = 'https://www.healthline.com/health-news'
    response = requests.get(url)
    response.raise_for_status()  # Ensure the request was successful
    soup = BeautifulSoup(response.text, 'html.parser')

    # Healthline: Update these selectors based on the site's current HTML structure.
    articles = soup.find_all('li', class_='css-yah9nt')
    healthline_articles = []
    for article in articles:
        title_tag = article.find('h2', class_='css-16o4j9x css-8qhvq0')
        if title_tag:
            title = title_tag.get_text(strip=True)
            link_tag = article.find('a', class_='css-a63gyd')
            link = link_tag['href'] if link_tag and link_tag.get('href') else ''
            if link and not link.startswith('http'):
                link = 'https://www.healthline.com' + link
            description_tag = article.find('p', class_='css-1hw29i9')
            description = description_tag.get_text(strip=True) if description_tag else 'No description available'
            date_tag = article.find('div', class_='css-5ry8xk')
            date_str = date_tag.get_text(strip=True) if date_tag else 'No date available'
            date_obj = parse_date(date_str)
            healthline_articles.append({
                'title': title,
                'link': link,
                'description': description,
                'date': date_str,
                'date_obj': date_obj  # temporary field for sorting
            })
    return healthline_articles

def scrape_medicalnewstoday():
    url = 'https://www.medicalnewstoday.com/news'
    response = requests.get(url)
    response.raise_for_status()  # Ensure the request was successful
    soup = BeautifulSoup(response.text, 'html.parser')

    # Medical News Today: Update these selectors based on the site's current HTML structure.
    articles = soup.find_all('li', class_='css-6x6b1i')
    mnt_articles = []
    for article in articles:
        title_tag = article.find('h2', class_="css-6y2217 css-12no7hq")
        if title_tag:
            title = title_tag.get_text(strip=True)
            link_tag = article.find('a', class_="css-aw4mqk")
            link = link_tag['href'] if link_tag and link_tag.get('href') else ''
            if link and not link.startswith('http'):
                link = 'https://www.medicalnewstoday.com' + link
            description_tag = article.find('p', class_="css-1hw29i9")
            description = description_tag.get_text(strip=True) if description_tag else 'No description available'
            date_tag = article.find('div', class_='css-19hhrie')
            date_str = date_tag.get_text(strip=True) if date_tag else 'No date available'
            date_obj = parse_date(date_str)
            mnt_articles.append({
                'title': title,
                'link': link,
                'description': description,
                'date': date_str,
                'date_obj': date_obj  # temporary field for sorting
            })
    return mnt_articles

@router.get("/latest-news")
async def latest_news():
    try:
        healthline_articles = scrape_healthline()
        mnt_articles = scrape_medicalnewstoday()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping data: {e}")
    combined_articles = healthline_articles + mnt_articles
    combined_articles.sort(key=lambda x: x['date_obj'] or datetime.min, reverse=True)
    return JSONResponse(content={"articles": combined_articles})
