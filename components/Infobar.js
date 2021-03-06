/** @jsx jsx */
import { Fragment, useState } from 'react';
import { jsx, Box, NavLink, Text, Flex } from 'theme-ui';
import Link from 'next/link';

const ContentsMenuItem = ({
  resourcePath,
  slug,
  title,
  anchor,
  root,
  activeAnchor,
  setActiveAnchor,
}) => {
  const active = activeAnchor === anchor;
  return (
    <Box
      as="li"
      sx={{
        variant: 'styles.fakeLi',
        m: 0,
        border: active ? 'light' : undefined,
        borderColor: 'primary',
        borderWidth: '0 0 0 1px',
      }}
    >
      <Link href={`/${resourcePath}/[slug]`} as={`/${resourcePath}/${slug}#${anchor}`} passHref>
        <NavLink
          variant="infobar"
          onClick={() => setActiveAnchor(anchor)}
          sx={{
            textAlign: 'left',
            color: active ? 'text' : undefined,
            borderRadius: 'xs',
            py: 1,
            px: 4,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </NavLink>
      </Link>
    </Box>
  );
};

const FileContents = ({ resourcePath, slug, toc }) => {
  const [activeAnchor, setActiveAnchor] = useState(toc[0].slug);
  const h1s = toc.filter((x) => x.lvl === 1);
  return toc.map(({ content: title, slug: anchor, lvl }, i) => {
    // Don't need nesting more than 3 levels deep for the TOC
    if (lvl > 3) return null;

    const root = h1s.length === 1 ? lvl === 1 || lvl === 2 : lvl === 1;
    return (
      <Fragment key={`${anchor}${i}`}>
        {root ? (
          <ContentsMenuItem
            resourcePath={resourcePath}
            slug={slug}
            key={anchor}
            title={title}
            anchor={anchor}
            activeAnchor={activeAnchor}
            setActiveAnchor={setActiveAnchor}
            root
          />
        ) : (
          <ul
            sx={{
              m: 0,
              p: 0,
              pl: 3,
            }}
          >
            <ContentsMenuItem
              resourcePath={resourcePath}
              slug={slug}
              key={anchor}
              title={title}
              anchor={anchor}
              activeAnchor={activeAnchor}
              setActiveAnchor={setActiveAnchor}
            />
          </ul>
        )}
      </Fragment>
    );
  });
};

const Infobar = ({ resourcePath, slug, toc }) => {
  return (
    <Box
      sx={{
        border: 'solid',
        borderColor: 'mutedAlt',
        borderWidth: '0 0 0 1px',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          border: 'solid',
          borderColor: 'mutedAlt',
          borderWidth: '0 0 1px 0',
          width: '100%',
        }}
      >
        <Text sx={{ fontFamily: 'FT Base', p: 3, pl: 4 }} variant="microText">
          Contents
        </Text>
      </Box>
      <Box sx={{ pl: 0, pr: 3, pt: 3 }}>
        <Text sx={{ pl: 4, pt: 0, pb: 2, color: 'textMuted' }} variant="caps">
          On This Page
        </Text>
        <FileContents resourcePath={resourcePath} slug={slug} toc={toc} />
      </Box>
    </Box>
  );
};

export default Infobar;
