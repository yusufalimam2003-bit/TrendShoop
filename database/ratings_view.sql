create or replace view product_ratings as
select
  product_id,
  round(avg(stars)::numeric, 1) as avg_rating,
  count(*) as review_count
from reviews
group by product_id;