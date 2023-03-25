<?php

declare(strict_types=1);

namespace Articles;


class Articles
{
    private $db;
    private $tableName = 'articles';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getArticle($id, $val)
    {
        $this->db->getFromTable($this->tableName, $id, $val);
    }

    public function getPacketArticle($limit, $offset)
    {
        return $this->db->getAllWithLimit($this->tableName, $limit, $offset);
    }

    public function addArticle()
    {
    }

    public function deleteArticle($id)
    {
        return $this->db->deleteFromTable($this->tableName, $id);
    }

    public function updateArticle($id, $param, $val)
    {
        return $this->db->updateItemInTable($this->tableName, $param, $val, $id);
    }

}