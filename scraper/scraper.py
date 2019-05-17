#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup
import urllib
import itertools
import json

import gspread
from oauth2client.service_account import ServiceAccountCredentials

import argparse
import time


SCHOOL_NAME = "EDHEC Business School"
# SCHOOL_NAME = "ESSEC"
LINKEDIN_SITE = "site:linkedin.com"
# LINKEDIN_SITE = "site:fr.linkedin.com"
# SEARCH_ENGINE = 'https://www.google.com/'
SEARCH_ENGINE = 'https://www.bing.com/'

USER_AGENT = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
              'Chrome/73.0.3683.86 Safari/537.36'}
JOB_TITLES_REPLACEMENTS = {"resp.": "responsable", "dir.": "director", "pdg": "president directeur general"}
FEMALE_TITLES = {"directeur": "directrice", "consultant": "consultante", "controleur": "controleuse",
                 "assistant": "assistante", "acheteur": "acheteuse", "avocat": "avocate", "manageur": "manageuse",
                 }


def fetch(url):
    response = requests.get(url, headers=USER_AGENT)
    response.raise_for_status()
    return response.text


def search(query, number_results, language):
    google_url = SEARCH_ENGINE + 'search?q={}&num={}&hl={}'.format(urllib.parse.quote(query),
                                                                   number_results, language)
    response = requests.get(google_url, headers=USER_AGENT)
    response.raise_for_status()
    return response.text


def sanitize_company(company):
    if "EDHEC" in company:
        company = ""
    if "|" in company:
        company = company.split("|")[0]
    return company


def parse_search_html(html, google=True, bing=False):
    soup = BeautifulSoup(html, 'html.parser')

    SEP = " - "

    results = []
    if google:
        result_block = soup.find_all('div', attrs={'class': 'g'})
    elif bing:
        result_block = soup.find_all('li', attrs={'class': 'b_algo'})
    for result in result_block:
        link = result.find('a', href=True)
        if google:
            title = result.find('h3').get_text()
        elif bing:
            title = result.find('a').get_text()

        # print("found %s: %s" % (title, link))
        if link and title and SEP in title:
            profile_url = link['href']
            if "linkedin.com/in/" not in profile_url:
                continue
            try:
                name, title, company = title.split(SEP)
            except ValueError:
                continue
            company = sanitize_company(company)
            results.append({'name': name, 'title': title, 'company': company, 'profile_url': profile_url})
    return results


def parse_robots_html(html):
    soup = BeautifulSoup(html, 'html.parser')

    probability = soup.find('div', attrs={'class': 'probability'}).get_text()
    growth = soup.find(id="ContentPlaceHolder1_PanelProjectedGrowth").find('h4').get_text()
    salary = soup.find(id="ContentPlaceHolder1_PanelMedianAnnualWage").find('h4').get_text()
    people = soup.find(id="ContentPlaceHolder1_PanelPeopleEmployed").find('h4').get_text()

    return {'probability': probability, 'growth': growth, 'salary': salary, 'people': people}


def expand(title):
    results = []
    titles = title.split("/")
    for title in titles:
        title = title.strip()
        for (k, v) in JOB_TITLES_REPLACEMENTS.items():
            if k in title:
                title = title.replace(k, v)
        results.append(title)
        for (k, v) in FEMALE_TITLES.items():
            if k in title:
                results.append(title.replace(k, v))
    return results


def get_sheet(name):
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name('../../client_secret.json', scope)
    client = gspread.authorize(creds)
    sheet = client.open(name).sheet1
    return sheet


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--alumni", help="Update alumni list", action="store_true")
    parser.add_argument("--robots", help="Update data from willrobotstakemyjob.com", action="store_true")
    args = parser.parse_args()

    sheet = get_sheet("Copy of métiers des diplômés EDHEC PS 2015 à 2017")
    # records = sheet.get_all_records()
    # print(records)

    job_titles = zip(sheet.col_values(1)[1:], sheet.col_values(2)[1:])
    # print(list(job_titles))

    robots_links = sheet.col_values(4)[1:]

    if args.alumni:
        print("--- Updating alumni list")
        row = 1
        start_col = 11
        for job_title_tuple in job_titles:
            row += 1
            job_title = map(lambda x: x.lower(), job_title_tuple)
            titles = [title for titles in map(expand, job_title_tuple) for title in titles]
            # print("titles = " + str(titles))

            alumni = []
            for job_title in titles:
                query = '{} "{}" "{}"'.format(LINKEDIN_SITE, SCHOOL_NAME, job_title)
                html = search(query, 10, 'en')
                time.sleep(1)
                alumni.append(parse_search_html(html, "google" in SEARCH_ENGINE, "bing" in SEARCH_ENGINE))
            alumni = itertools.zip_longest(*alumni)
            alumni = [item for item_list in alumni for item in item_list if item is not None]
            alumni = alumni[:5]
            print('[row %d]' % row)
            print(list(alumni))
            print('')
            for i in range(len(alumni)):
                sheet.update_cell(row, start_col + i, json.dumps(alumni[i]))
                time.sleep(1)

    if args.robots:
        print("-- Updating data from willrobotstakemyjob.com")
        row = 1
        start_col = 5
        for robots_link in robots_links:
            row += 1
            html = fetch(robots_link)
            # print(html)
            results = parse_robots_html(html)
            # print(results)
            sheet.update_cell(row, start_col + 0, results['probability'])
            time.sleep(1)
            sheet.update_cell(row, start_col + 1, results['growth'])
            time.sleep(1)
            sheet.update_cell(row, start_col + 2, results['salary'])
            time.sleep(1)
            sheet.update_cell(row, start_col + 3, results['people'])
            time.sleep(1)


if __name__ == '__main__':
    main()
