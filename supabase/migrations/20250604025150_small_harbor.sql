/*
  # Initial schema setup for FPS lineup tool

  1. New Tables
    - heroes
      - id (uuid, primary key)
      - name (text, unique)
      - skills (text array)
    - maps
      - id (uuid, primary key)
      - name (text, unique)
      - image (bytea)
    - lineups
      - id (uuid, primary key)
      - hero_id (uuid, references heroes)
      - map_id (uuid, references maps)
      - skill (text)
      - start_x (float)
      - start_y (float)
      - end_x (float)
      - end_y (float)
    - lineup_descriptions
      - id (uuid, primary key)
      - lineup_id (uuid, references lineups)
      - text (text)
      - image (bytea)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to create/update/delete
*/

-- Heroes table
CREATE TABLE heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  skills text[] DEFAULT '{}'::text[]
);

ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on heroes"
  ON heroes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create/update heroes"
  ON heroes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Maps table
CREATE TABLE maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  image bytea NOT NULL
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on maps"
  ON maps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create/update maps"
  ON maps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lineups table
CREATE TABLE lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid REFERENCES heroes(id) ON DELETE CASCADE NOT NULL,
  map_id uuid REFERENCES maps(id) ON DELETE CASCADE NOT NULL,
  skill text NOT NULL,
  start_x float NOT NULL,
  start_y float NOT NULL,
  end_x float NOT NULL,
  end_y float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on lineups"
  ON lineups
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create/update/delete lineups"
  ON lineups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lineup descriptions table
CREATE TABLE lineup_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id uuid REFERENCES lineups(id) ON DELETE CASCADE NOT NULL,
  text text,
  image bytea NOT NULL
);

ALTER TABLE lineup_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on lineup descriptions"
  ON lineup_descriptions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create/update/delete lineup descriptions"
  ON lineup_descriptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);