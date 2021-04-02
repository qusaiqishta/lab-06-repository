
CREATE TABLE location(
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(50),
    formatted_query VARCHAR(200),
    latitude VARCHAR(200),
    longitude VARCHAR(200) 
);