import Error from 'next/error';
import { useRouter } from 'next/router';
import matter from 'gray-matter';
import { getGithubPreviewProps, parseMarkdown, parseJson } from 'next-tinacms-github';
import ResourceEditor from '@components/ResourceEditor';
import { createToc, getResources } from '@utils';
import { ContentTypes } from '../../utils/constants';

const GuidesPage = ({ file, resources, ...props }) => {
  const router = useRouter();

  const moduleResources = resources?.filter(
    (r) =>
      r.data.frontmatter.components.some((c) => file.data.frontmatter.components.includes(c)) &&
      r.data.frontmatter.contentType === ContentTypes.SECURITY
  );

  return !file ? (
    <Error statusCode={404} />
  ) : router.isFallback ? (
    <div>Loading...</div>
  ) : (
    <ResourceEditor
      resources={moduleResources}
      file={file}
      contentType={ContentTypes.SECURITY}
      {...props}
    />
  );
};

export const getStaticProps = async function ({ preview, previewData, params }) {
  const { slug } = params;
  let toc = '';

  const resources = await getResources(preview, previewData, 'content/resources/security');
  const resource = resources.find((r) => r.data.frontmatter.slug === slug);
  const fileRelativePath = resource.fileRelativePath;

  if (preview) {
    const navFile = await getGithubPreviewProps({
      ...previewData,
      fileRelativePath: 'data/securitySubNav.json',
      parse: parseJson,
    });

    const markdownFile = await getGithubPreviewProps({
      ...previewData,
      fileRelativePath,
      parse: parseMarkdown,
    });
    if (typeof window === 'undefined') {
      toc = createToc(markdownFile.props.file.data.markdownBody);
    }

    markdownFile.props.file.data.frontmatter = {
      ...resource.data.frontmatter,
      ...markdownFile.props.file.data.frontmatter,
    };
    return {
      props: {
        navFile: {
          ...navFile.props.file,
        },
        resources,
        toc,
        previewURL: `https://raw.githubusercontent.com/${previewData.working_repo_full_name}/${previewData.head_branch}`,
        ...markdownFile.props,
      },
    };
  }

  if (typeof window === 'undefined') {
    toc = createToc(resource.data.markdownBody);
  }
  return {
    props: {
      navFile: {
        fileRelativePath: 'data/securitySubNav.json',
        data: (await import('../../data/securitySubNav.json')).default,
      },
      slug,
      resources,
      toc,
      sourceProvider: null,
      error: null,
      preview: false,
      // the markdown file
      file: {
        fileRelativePath: resource.fileRelativePath,
        data: {
          frontmatter: resource.data.frontmatter,
          markdownBody: resource.data.markdownBody,
        },
      },
    },
  };
};

export const getStaticPaths = async function () {
  const fg = require('fast-glob');
  const contentDir = 'content/resources/security';
  const files = await fg(`${contentDir}/**/*.md`);

  const paths = files.reduce((acc, file) => {
    const content = require(`../../content/resources/security${file.replace(contentDir, '')}`);
    const { data } = matter(content.default);
    if (data.slug) acc.push({ params: { slug: data.slug } });
    return acc;
  }, []);

  return {
    fallback: true,
    paths,
  };
};

export default GuidesPage;
