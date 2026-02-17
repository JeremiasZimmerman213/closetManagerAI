alter table public.clothing_items
add column if not exists name text,
add column if not exists brand text,
add column if not exists subtype text;

update public.clothing_items
set name = coalesce(
  nullif(btrim(notes), ''),
  nullif(
    btrim(
      concat_ws(
        ' ',
        nullif(btrim(brand), ''),
        nullif(colors[1], ''),
        coalesce(nullif(btrim(subtype), ''), btrim(category))
      )
    ),
    ''
  ),
  btrim(category)
)
where name is null or btrim(name) = '';

alter table public.clothing_items
alter column name set not null;
